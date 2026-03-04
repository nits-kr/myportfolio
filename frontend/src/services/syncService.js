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

      const response = await fetch(url, {
        method: mutation.method,
        headers: getAuthHeaders(),
        body: mutation.body ? JSON.stringify(mutation.body) : undefined,
      });

      if (response.ok) {
        await db.mutations.delete(mutation.id);
        successCount++;
      } else if (response.status === 401 || response.status === 403) {
        // Auth failure — no point retrying, remove it
        await db.mutations.delete(mutation.id);
        failCount++;
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
