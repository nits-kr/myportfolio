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

  // ── Mutation Requests (POST/PUT/PATCH/DELETE) ─────────────────────────────
  if (!isOnline) {
    // Stage in WAL (Write-Ahead Log) for later sync
    await db.mutations.add({
      endpoint: url, // ✅ Fixed: was using args.url || args — now always uses normalized url
      method,
      body: body ?? null,
      status: "pending",
      retryCount: 0,
      timestamp: Date.now(),
    });

    // Return optimistic success so UI doesn't freeze
    return {
      data: { ...(body ?? {}), _offlineStaged: true, _stagedAt: Date.now() },
    };
  }

  // Online: execute mutation normally, with in-flight error handling
  try {
    return await baseQuery(args, api, extraOptions);
  } catch {
    // Connection dropped mid-flight — stage for retry
    await db.mutations.add({
      endpoint: url,
      method,
      body: body ?? null,
      status: "pending",
      retryCount: 0,
      timestamp: Date.now(),
    });
    return {
      data: { ...(body ?? {}), _offlineStaged: true, _stagedAt: Date.now() },
    };
  }
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: offlineBaseQuery,
  tagTypes: ["Project", "Blog", "Comment", "SubUser"],
  endpoints: () => ({}),
});
