/**
 * toolsApi.js — Developer tools endpoints
 * Injected into the offline-aware apiSlice for WAL + sync support.
 */
import { apiSlice } from "./apiSlice";

export const toolsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    validateEmail: builder.mutation({
      query: (data) => ({
        url: "/tools/validate-email",
        method: "POST",
        body: data,
      }),
    }),
  }),
  overrideExisting: true,
});

export const { useValidateEmailMutation } = toolsApi;
