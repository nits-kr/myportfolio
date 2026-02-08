import { apiSlice } from "./apiSlice";

export const analyticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAnalyticsStats: builder.query({
      query: ({ window = "7d" } = {}) => `/analytics/stats?window=${window}`,
    }),
    getAnalyticsSessions: builder.query({
      query: ({ page = 1, limit = 20 } = {}) =>
        `/analytics/sessions?page=${page}&limit=${limit}`,
    }),
  }),
});

export const { useGetAnalyticsStatsQuery, useGetAnalyticsSessionsQuery } =
  analyticsApi;
