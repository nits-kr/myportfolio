import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import db from "@/lib/db";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token || localStorage.getItem("token");
    const user =
      getState().auth.user || JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      if (user.role === "admin") {
        headers.set("x-auth-token-admin", token);
      } else {
        headers.set("x-auth-token-user", token);
      }
    }
    return headers;
  },
});

const offlineBaseQuery = async (args, api, extraOptions) => {
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  const {
    endpoint,
    method = "GET",
    body,
  } = typeof args === "string" ? { endpoint: args } : args;
  const cacheKey = typeof args === "string" ? args : JSON.stringify(args);

  // Handle Queries (GET)
  if (method === "GET") {
    try {
      // 1. Try to get from Dexie first (Offline-First)
      const cached = await db.content.get(cacheKey);

      if (isOnline) {
        // 2. If online, fetch from network in background
        const result = await baseQuery(args, api, extraOptions);

        if (!result.error) {
          // 3. Update Dexie with fresh data
          await db.content.put({
            key: cacheKey,
            data: result.data,
            timestamp: Date.now(),
          });
          return result;
        }

        // If network fails but we have cache, return cache
        if (cached) return { data: cached.data };
        return result;
      }

      // 3. If offline, return cached if available
      if (cached) return { data: cached.data };
      return {
        error: {
          status: "FETCH_ERROR",
          error: "Offline and no cached data available",
        },
      };
    } catch (err) {
      return { error: { status: "CUSTOM_ERROR", error: err.message } };
    }
  }

  // Handle Mutations (POST, PATCH, DELETE, etc.)
  if (!isOnline) {
    // Stage mutation in WAL (Write-Ahead Log)
    const mutation = {
      endpoint: args.url || args,
      method,
      body,
      status: "pending",
      timestamp: Date.now(),
    };
    await db.mutations.add(mutation);

    // Return optimistic success (assuming the sync will work later)
    return { data: { ...body, _offlineStaged: true } };
  }

  return baseQuery(args, api, extraOptions);
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: offlineBaseQuery,
  tagTypes: ["Project", "Blog"],
  endpoints: (builder) => ({}),
});
