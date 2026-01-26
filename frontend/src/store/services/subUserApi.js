import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const subUserApi = createApi({
  reducerPath: "subUserApi",
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
  tagTypes: ["SubUser"],
  endpoints: (builder) => ({
    getAllSubUsers: builder.query({
      query: () => "sub-users",
      providesTags: ["SubUser"],
    }),
    createSubUser: builder.mutation({
      query: (data) => ({
        url: "sub-users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SubUser"],
    }),
    updateSubUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `sub-users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SubUser"],
    }),
    deleteSubUser: builder.mutation({
      query: (id) => ({
        url: `sub-users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SubUser"],
    }),
    changeSubUserStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `sub-users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["SubUser"],
    }),
    subuserDeleteStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `sub-users/${id}/delete-status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["SubUser"],
    }),
  }),
});

export const {
  useGetAllSubUsersQuery,
  useCreateSubUserMutation,
  useUpdateSubUserMutation,
  useDeleteSubUserMutation,
  useChangeSubUserStatusMutation,
  useSubuserDeleteStatusMutation,
} = subUserApi;
