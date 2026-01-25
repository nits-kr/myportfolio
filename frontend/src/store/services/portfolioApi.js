import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
export const portfolioApi = createApi({
  reducerPath: "portfolioApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    prepareHeaders: (headers, { getState }) => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const user =
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("user"))
          : null;

      if (token && user) {
        if (user.role === "admin") {
          headers.set("x-auth-token-admin", token);
        } else {
          headers.set("x-auth-token-user", token);
        }
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: () => "projects",
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: "auth/register",
        method: "POST",
        body: userData,
      }),
    }),
    login: builder.mutation({
      query: (userData) => ({
        url: "auth/login",
        method: "POST",
        body: userData,
      }),
    }),
    getMe: builder.query({
      query: () => "auth/me",
    }),
  }),
});
export const {
  useGetProjectsQuery,
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
} = portfolioApi;
