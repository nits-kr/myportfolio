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
    getAnalyticsChartData: builder.query({
      query: ({ window = "7d" } = {}) => `/analytics/chart?window=${window}`,
    }),
  }),
});

export const {
  useGetAnalyticsStatsQuery,
  useGetAnalyticsSessionsQuery,
  useGetAnalyticsChartDataQuery,
} = analyticsApi;
