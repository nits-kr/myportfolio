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
      const isProject = endpoint.includes("/projects");
      const isBlog = endpoint.includes("/blogs");
      if (!isProject && !isBlog) return;

      const stagedItem = {
        ...bodyData,
        _id: bodyData?._id || `temp-${Date.now()}`,
        _offlineStaged: true,
        _stagedAt: Date.now(),
      };

      const allCaches = await db.content.toArray();

      for (const cache of allCaches) {
        const isTargetCache = isProject
          ? cache.key.includes("/projects")
          : cache.key.includes("/blogs");

        if (isTargetCache && cache.data && Array.isArray(cache.data.data)) {
          let updatedList = [...cache.data.data];

          if (
            method === "POST" &&
            (endpoint === "/projects" || endpoint === "/blogs")
          ) {
            // Add new item to front of list
            updatedList.unshift(stagedItem);
          } else if (method === "PUT" || method === "PATCH") {
            // Update existing item
            const idToUpdate = endpoint.split("/").pop();
            updatedList = updatedList.map((item) =>
              item._id === idToUpdate ? { ...item, ...stagedItem } : item,
            );
          } else if (method === "DELETE") {
            // Remove item
            // Check if endpoint ends with ID or if it's the specific delete-status endpoint
            const parts = endpoint.split("/");
            const idToDelete = parts.pop();
            updatedList = updatedList.filter((item) => item._id !== idToDelete);
          }

          cache.data.data = updatedList;
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
    // Stage in WAL (Write-Ahead Log) for later sync
    // PREVENT DUPLICATES: Check if this mutation is already pending
    const existing = await db.mutations
      .where({ endpoint: url, method })
      .filter((m) => m.status === "pending")
      .first();

    if (!existing) {
      await db.mutations.add({
        endpoint: url, // ✅ always uses normalized url
        method,
        body: body ?? null,
        status: "pending",
        retryCount: 0,
        timestamp: Date.now(),
      });
    }

    // Apply optimistic update to local cache
    await handleOptimisticOfflineUpdate(method, url, body);

    // Return optimistic success so UI doesn't freeze
    const responseId =
      body?._id || url.split("/").pop() || `temp-${Date.now()}`;
    return {
      data: {
        ...(body ?? {}),
        _id: responseId,
        _offlineStaged: true,
        _stagedAt: Date.now(),
      },
    };
  }

  // Online: execute mutation normally, with in-flight error handling
  try {
    return await baseQuery(args, api, extraOptions);
  } catch {
    // Connection dropped mid-flight — stage for retry
    const existing = await db.mutations
      .where({ endpoint: url, method })
      .filter((m) => m.status === "pending")
      .first();

    if (!existing) {
      await db.mutations.add({
        endpoint: url,
        method,
        body: body ?? null,
        status: "pending",
        retryCount: 0,
        timestamp: Date.now(),
      });
    }

    // Apply optimistic update to local cache
    await handleOptimisticOfflineUpdate(method, url, body);

    const responseId =
      body?._id || url.split("/").pop() || `temp-${Date.now()}`;
    return {
      data: {
        ...(body ?? {}),
        _id: responseId,
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
