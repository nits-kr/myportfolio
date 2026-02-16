import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const toolsApi = createApi({
  reducerPath: "toolsApi",
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
    validateEmail: builder.mutation({
      query: (data) => ({
        url: "tools/validate-email",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useValidateEmailMutation } = toolsApi;
