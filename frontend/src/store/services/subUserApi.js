/**
 * subUserApi.js — Sub-user management endpoints
 * Injected into the offline-aware apiSlice for WAL + sync support.
 */
import { apiSlice } from "./apiSlice";

export const subUserApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllSubUsers: builder.query({
      query: () => ({ url: "/sub-users", method: "GET" }),
      providesTags: ["SubUser"],
    }),
    createSubUser: builder.mutation({
      query: (data) => ({ url: "/sub-users", method: "POST", body: data }),
      invalidatesTags: ["SubUser"],
    }),
    updateSubUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/sub-users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SubUser"],
    }),
    deleteSubUser: builder.mutation({
      query: (id) => ({ url: `/sub-users/${id}`, method: "DELETE" }),
      invalidatesTags: ["SubUser"],
    }),
    changeSubUserStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/sub-users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["SubUser"],
    }),
    subuserDeleteStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/sub-users/${id}/delete-status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["SubUser"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAllSubUsersQuery,
  useCreateSubUserMutation,
  useUpdateSubUserMutation,
  useDeleteSubUserMutation,
  useChangeSubUserStatusMutation,
  useSubuserDeleteStatusMutation,
} = subUserApi;
