import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import db from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ─── Base query with auth headers ────────────────────────────────────────────
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token || localStorage.getItem("token");
    const user = (() => {
      try {
        return getState().auth.user || JSON.parse(localStorage.getItem("user"));
      } catch {
        return null;
      }
    })();

    if (token && user) {
      headers.set(
        user.role === "admin" ? "x-auth-token-admin" : "x-auth-token-user",
        token,
      );
    }
    return headers;
  },
});

// ─── Derive a stable cache key from RTK Query args ───────────────────────────
const getCacheKey = (args) => {
  if (typeof args === "string") return args;
  const { url, method = "GET", body } = args;
  return `${method}:${url}:${JSON.stringify(body ?? {})}`;
};

// ─── Offline-aware base query ─────────────────────────────────────────────────
const offlineBaseQuery = async (args, api, extraOptions) => {
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  // Normalize args into a consistent shape
  const normalized =
    typeof args === "string"
      ? { url: args, method: "GET" }
      : { method: "GET", ...args };

  const { url, method, body } = normalized;
  const cacheKey = getCacheKey(args);

  // ── GET Requests: Offline-first with background revalidation ─────────────
  if (method === "GET") {
    try {
      const cached = await db.content.get(cacheKey);

      if (isOnline) {
        try {
          const result = await baseQuery(args, api, extraOptions);

          if (!result.error) {
            await db.content.put({
              key: cacheKey,
              data: result.data,
              timestamp: Date.now(),
            });
            return result;
          }

          // Network returned an error but we have cache — return cache
          if (cached) return { data: cached.data };
          return result;
        } catch {
          // In-flight error (connection dropped mid-request)
          if (cached) return { data: cached.data };
          return {
            error: {
              status: "FETCH_ERROR",
              error: "Network error — using cached data",
            },
          };
        }
      }

      // Offline — serve from cache
      if (cached) return { data: cached.data };
      return {
        error: {
          status: "FETCH_ERROR",
          error: "You are offline and this page has no cached data.",
        },
      };
    } catch (err) {
      return { error: { status: "CUSTOM_ERROR", error: err.message } };
    }
  }

  // ── Helper to Optimistically Patch Offline Cache ───────────────────────────
  const handleOptimisticOfflineUpdate = async (method, endpoint, bodyData) => {
    try {
      const cleanEndpoint = endpoint.split("?")[0];
      const isProject = cleanEndpoint.includes("/projects");
      const isBlog = cleanEndpoint.includes("/blogs");
      if (!isProject && !isBlog) return;

      // Strip binary/non-UI fields so they are never stored in the list cache.
      // image_base64 can be several MB — it lives only in the WAL (mutations table),
      // not in the content cache. Also inject createdAt so date columns never
      // render "Invalid Date" for offline-staged items.
      const { image_base64, image_name, ...cleanBodyData } = bodyData || {};
      const stagedItem = {
        ...cleanBodyData,
        _id: cleanBodyData?._id || `temp-${Date.now()}`,
        _offlineStaged: true,
        _stagedAt: Date.now(),
        // Guarantee a valid date so list renderers never display "Invalid Date"
        createdAt: cleanBodyData?.createdAt || new Date().toISOString(),
      };

      const allCaches = await db.content.toArray();

      for (const cache of allCaches) {
        const isTargetCache = isProject
          ? cache.key.includes("/projects")
          : cache.key.includes("/blogs");

        if (isTargetCache && cache.data) {
          let updatedList;
          let isBlogObject = false;

          if (Array.isArray(cache.data.data)) {
            updatedList = [...cache.data.data];
          } else if (cache.data.data && Array.isArray(cache.data.data.blogs)) {
            updatedList = [...cache.data.data.blogs];
            isBlogObject = true;
          } else {
            // Not a list cache (e.g., specific item detail page), skip
            continue;
          }

          if (
            method === "POST" &&
            (cleanEndpoint === "/projects" || cleanEndpoint === "/blogs")
          ) {
            // Add new item to front of list
            updatedList.unshift(stagedItem);
          } else if (
            (method === "PUT" || method === "PATCH") &&
            !cleanEndpoint.includes("/delete-status")
          ) {
            // Update existing item
            const idToUpdate = cleanEndpoint.split("/").pop();
            updatedList = updatedList.map((item) =>
              String(item._id) === idToUpdate
                ? { ...item, ...stagedItem }
                : item,
            );
          } else if (
            method === "DELETE" ||
            (method === "PUT" && cleanEndpoint.includes("/delete-status"))
          ) {
            // Remove item
            const idToDelete = cleanEndpoint.split("/").pop();
            updatedList = updatedList.filter(
              (item) => String(item._id) !== idToDelete,
            );
          }

          if (isBlogObject) {
            cache.data.data.blogs = updatedList;
          } else {
            cache.data.data = updatedList;
          }
          await db.content.put(cache);
        }
      }
    } catch (err) {
      console.warn(
        "[Offline] Failed to apply optimistic update to cache:",
        err,
      );
    }
  };

  // ── Mutation Requests (POST/PUT/PATCH/DELETE) ─────────────────────────────
  if (!isOnline) {
    // Generate a consistent offline ID now to ensure WAL and Cache share the exact same temp ID
    let finalBody = body;
    if (finalBody && typeof finalBody === "object" && !finalBody._id) {
      if (method === "POST" || method === "PUT" || method === "PATCH") {
        finalBody = { ...finalBody, _id: `temp-${Date.now()}` };
      }
    }

    // Prevent duplicate DELETE operations in the offline queue
    const isDeleteEquivalent =
      method === "DELETE" ||
      (method === "PUT" && url.includes("/delete-status"));

    if (isDeleteEquivalent) {
      try {
        const pendingMutations = await db.mutations
          .where("status")
          .equals("pending")
          .toArray();

        // Check if there is a pending POST mutation for this exact item that hasn't synced yet.
        // We know it's the exact item if the ID matches the end of the URL.
        const idToDelete = url.split("/").pop();

        // Find if this item was generated offline (it has a temp ID in the pending POST requests)
        const pendingPost = pendingMutations.find(
          (m) =>
            m.method === "POST" &&
            (m.body?._id === idToDelete || String(m.id) === idToDelete), // Sometimes the temp ID is not in body
        );

        if (pendingPost) {
          // We created this offline, and now we are deleting it offline before it ever synced!
          // Just delete the POST from the WAL and skip queuing the DELETE. They cancel each other out.
          console.log(
            `[Offline] Pruning pending POST for ${idToDelete} as it was deleted before syncing.`,
          );
          await db.mutations.delete(pendingPost.id);
          await handleOptimisticOfflineUpdate(method, url, finalBody);
          return { data: { success: true, _offlinePruned: true } };
        }

        const isAlreadyQueued = pendingMutations.some(
          (m) =>
            m.endpoint === url &&
            (m.method === "DELETE" || m.endpoint.includes("/delete-status")),
        );

        if (isAlreadyQueued) {
          // Already queued for deletion! Apply optimistic patch again just in case, and short-circuit.
          await handleOptimisticOfflineUpdate(method, url, finalBody);
          return { data: { success: true, _offlineDuplicate: true } };
        }
      } catch (err) {
        console.warn("[Offline] Failed to check for duplicate deletes:", err);
      }
    }

    // Stage in WAL (Write-Ahead Log) for later sync
    await db.mutations.add({
      endpoint: url, // ✅ always uses normalized url
      method,
      body: finalBody ?? null,
      status: "pending",
      retryCount: 0,
      timestamp: Date.now(),
    });

    // Apply optimistic update to local cache
    await handleOptimisticOfflineUpdate(method, url, finalBody);

    // Return optimistic success so UI doesn't freeze
    const isDeleteEquivalentResponse =
      method === "DELETE" ||
      (method === "PUT" && url.includes("/delete-status"));

    return {
      data: isDeleteEquivalentResponse
        ? {
            success: true,
            id: url.split("/").pop(), // Crucial for RTK Query cache invalidation
            _offlineStaged: true,
            _stagedAt: Date.now(),
          }
        : {
            ...(finalBody ?? {}),
            _id: finalBody?._id,
            _offlineStaged: true,
            _stagedAt: Date.now(),
          },
    };
  }

  // Online: execute mutation normally, with in-flight error handling
  try {
    const result = await baseQuery(args, api, extraOptions);

    if (result.error) {
      // If it's a genuine API error returned normally (like 400 Validation Error)
      // We should just return the error so RTK Query handles it as a failed mutation.
      return result;
    }

    // Fix: If the backend returns data: {} but success is true (like createProject),
    // inject the request body so Redux doesn't overwrite cache with empty objects
    if (
      result.data &&
      result.data.success &&
      Object.keys(result.data.data || {}).length === 0
    ) {
      if (method === "POST" || method === "PUT" || method === "PATCH") {
        result.data.data = {
          ...body,
          // The backend didn't give us the real ID, so we might still need to rely on a temp one in local cache if we didn't refetch
          _id: body?._id || `temp-${Date.now()}`,
        };
      }
    }
    return result;
  } catch {
    // Generate a consistent offline ID now to ensure WAL and Cache share the exact same temp ID
    let finalBody = body;
    if (finalBody && typeof finalBody === "object" && !finalBody._id) {
      if (method === "POST" || method === "PUT" || method === "PATCH") {
        finalBody = { ...finalBody, _id: `temp-${Date.now()}` };
      }
    }

    // Prevent duplicate DELETE operations for dropped flights too!
    const isDeleteEquivalent =
      method === "DELETE" ||
      (method === "PUT" && url.includes("/delete-status"));

    if (isDeleteEquivalent) {
      try {
        const pendingDeletes = await db.mutations
          .where("status")
          .equals("pending")
          .toArray();

        const isAlreadyQueued = pendingDeletes.some(
          (m) =>
            m.endpoint === url &&
            (m.method === "DELETE" || m.endpoint.includes("/delete-status")),
        );

        if (isAlreadyQueued) {
          await handleOptimisticOfflineUpdate(method, url, finalBody);
          return {
            data: {
              success: true,
              id: url.split("/").pop(),
              _offlineStaged: true,
              _stagedAt: Date.now(),
              _offlineDuplicate: true,
            },
          };
        }
      } catch (err) {}
    }

    // Connection dropped mid-flight — stage for retry
    await db.mutations.add({
      endpoint: url,
      method,
      body: finalBody ?? null,
      status: "pending",
      retryCount: 0,
      timestamp: Date.now(),
    });

    // Apply optimistic update to local cache
    await handleOptimisticOfflineUpdate(method, url, finalBody);

    return {
      data: {
        ...(finalBody ?? {}),
        _id: finalBody?._id,
        _offlineStaged: true,
        _stagedAt: Date.now(),
      },
    };
  }
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: offlineBaseQuery,
  tagTypes: ["Project", "Blog", "Comment", "SubUser"],
  endpoints: () => ({}),
});
