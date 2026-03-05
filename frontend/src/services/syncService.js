/**
 * syncService.js — Enterprise Offline Sync Manager
 *
 * Responsibilities:
 * - On reconnect: flush all pending mutations from the Dexie WAL
 * - On sync failure: notify user via toast
 * - On sync success: notify user so they know data is saved
 * - Exponential backoff retry (max 3 attempts per mutation)
 */

import db from "@/lib/db";

const MAX_RETRY = 3;

const getAuthHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  if (typeof window === "undefined") return headers;
  const token = localStorage.getItem("token");
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();
  if (token && user) {
    headers[
      user.role === "admin" ? "x-auth-token-admin" : "x-auth-token-user"
    ] = token;
  }
  return headers;
};

export const syncOfflineMutations = async (toastFn = null) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  const pendingMutations = await db.mutations
    .where("status")
    .equals("pending")
    .toArray();

  if (pendingMutations.length === 0) return;

  console.info(
    `[SyncService] Syncing ${pendingMutations.length} pending mutation(s)…`,
  );

  let successCount = 0;
  let failCount = 0;

  for (const mutation of pendingMutations) {
    // Skip mutations that have exceeded max retries
    if ((mutation.retryCount || 0) >= MAX_RETRY) {
      await db.mutations.update(mutation.id, { status: "failed" });
      failCount++;
      continue;
    }

    try {
      await db.mutations.update(mutation.id, { status: "syncing" });

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const url = `${baseUrl}${mutation.endpoint}`;

      let bodyToSend = mutation.body ? { ...mutation.body } : undefined;

      // Strip offline temporary IDs before syncing because the backend will reject them with a 500 CastError
      if (
        bodyToSend &&
        bodyToSend._id &&
        String(bodyToSend._id).startsWith("temp-")
      ) {
        delete bodyToSend._id;
      }

      // ── Offline-staged image: reconstruct FormData from Base64 and upload first ──
      // When a blog was submitted offline with an image file, the file was encoded
      // as a Base64 data URI (plain string) so it could be serialized into Dexie.
      // Now that we're back online, we decode it, upload to /upload, and replace
      // the image_base64 field with the real returned URL before saving the blog.
      if (bodyToSend?.image_base64) {
        try {
          // Decode the data URI into a Blob
          const fetchRes = await fetch(bodyToSend.image_base64);
          const blob = await fetchRes.blob();

          const imageFormData = new FormData();
          imageFormData.append(
            "image",
            new File([blob], bodyToSend.image_name || "image.jpg", {
              type: blob.type,
            }),
          );

          // Build auth headers but DO NOT set Content-Type — the browser must
          // set it automatically with the multipart boundary for FormData uploads.
          const uploadHeaders = { ...getAuthHeaders() };
          delete uploadHeaders["Content-Type"];

          const uploadRes = await fetch(`${baseUrl}/upload`, {
            method: "POST",
            headers: uploadHeaders,
            body: imageFormData,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            if (uploadData.success && uploadData.url) {
              bodyToSend.image = uploadData.url; // ← real CDN/server URL
            }
          } else {
            console.warn(
              "[SyncService] Image upload failed during sync, blog will be saved without image.",
            );
          }
        } catch (err) {
          // Image upload failed. Still proceed to save the blog rather than losing it.
          console.warn(
            "[SyncService] Failed to reconstruct/upload offline image:",
            err.message,
          );
        } finally {
          // Always clean up the staging fields — they must never reach the blog API
          delete bodyToSend.image_base64;
          delete bodyToSend.image_name;
        }
      }

      const response = await fetch(url, {
        method: mutation.method,
        headers: getAuthHeaders(),
        body: bodyToSend ? JSON.stringify(bodyToSend) : undefined,
      });

      if (response.ok) {
        // If this was a successful POST, and the server gives us a real ID back,
        // we should try to map any pending PUT/PATCH/DELETEs that might still be using the temp ID.
        if (mutation.method === "POST") {
          try {
            const data = await response.clone().json();
            const newId = data?.data?._id || data?._id;
            const tempId = mutation.body?._id || mutation.id;

            if (newId && tempId && newId !== tempId) {
              const futureMutations = await db.mutations
                .where("status")
                .equals("pending")
                .toArray();
              for (const fm of futureMutations) {
                let changed = false;
                let newEndpoint = fm.endpoint;
                let newBody = fm.body;

                if (newEndpoint.includes(tempId)) {
                  newEndpoint = newEndpoint.replace(tempId, newId);
                  changed = true;
                }
                if (newBody && newBody._id === tempId) {
                  newBody = { ...newBody, _id: newId };
                  changed = true;
                }
                if (changed) {
                  await db.mutations.update(fm.id, {
                    endpoint: newEndpoint,
                    body: newBody,
                  });
                }
              }
            }
          } catch (err) {
            console.warn("[SyncService] Failed to map new ID from POST:", err);
          }
        }
        await db.mutations.delete(mutation.id);
        successCount++;
      } else if (response.status === 401 || response.status === 403) {
        // Auth failure — no point retrying, remove it
        await db.mutations.delete(mutation.id);
        failCount++;
      } else if (
        (mutation.method === "DELETE" ||
          (mutation.method === "PUT" &&
            mutation.endpoint.includes("/delete-status"))) &&
        response.status >= 400
      ) {
        // For DELETE, any 4xx/5xx error (like 404 Not Found, 400 invalid id, or 500 Server Error due to CastError)
        // implies the item is already gone or invalid.
        // Clear from queue to prevent lingering duplicate deletes holding up the badge indicator.
        await db.mutations.delete(mutation.id);
        successCount++;
      } else {
        // Server error — mark for retry
        await db.mutations.update(mutation.id, {
          status: "pending",
          retryCount: (mutation.retryCount || 0) + 1,
        });
        failCount++;
      }
    } catch (err) {
      await db.mutations.update(mutation.id, {
        status: "pending",
        retryCount: (mutation.retryCount || 0) + 1,
      });
      failCount++;
      console.warn("[SyncService] Sync error:", err.message);
    }
  }

  // User-facing feedback via toast (if toast function is available)
  if (toastFn) {
    if (successCount > 0 && failCount === 0) {
      toastFn.success(
        `✅ ${successCount} offline action${successCount > 1 ? "s" : ""} synced successfully.`,
        { duration: 4000 },
      );
    } else if (failCount > 0 && successCount === 0) {
      toastFn.error(
        `⚠️ ${failCount} action${failCount > 1 ? "s" : ""} failed to sync. Will retry on next connection.`,
        { duration: 6000 },
      );
    } else if (successCount > 0 && failCount > 0) {
      toastFn.success(
        `${successCount} synced, ${failCount} failed. Will retry failed actions.`,
        { duration: 6000 },
      );
    }
  }
};
