import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
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
  }),
  tagTypes: ["Project"],
  endpoints: (builder) => ({}),
});
