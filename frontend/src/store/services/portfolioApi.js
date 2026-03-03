import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
export const portfolioApi = createApi({
  reducerPath: "portfolioApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    credentials: "include",
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
    sendEmailVerificationOtp: builder.mutation({
      query: (data) => ({
        url: "auth/email-verification/send-otp",
        method: "POST",
        body: data,
      }),
    }),
    verifyEmailVerificationOtp: builder.mutation({
      query: (data) => ({
        url: "auth/email-verification/verify-otp",
        method: "POST",
        body: data,
      }),
    }),
    login: builder.mutation({
      query: (userData) => ({
        url: "auth/login",
        method: "POST",
        body: userData,
      }),
    }),
    sendPasswordResetOtp: builder.mutation({
      query: (data) => ({
        url: "auth/password-reset/send-otp",
        method: "POST",
        body: data,
      }),
    }),
    verifyPasswordResetOtp: builder.mutation({
      query: (data) => ({
        url: "auth/password-reset/verify-otp",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "auth/password-reset/reset",
        method: "POST",
        body: data,
      }),
    }),
    getMe: builder.query({
      query: () => "auth/me",
    }),
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: "auth/profile",
        method: "PUT",
        body: userData,
      }),
    }),
    getPublicProfile: builder.query({
      query: () => "auth/profile/public",
    }),
  }),
});
export const {
  useGetProjectsQuery,
  useRegisterMutation,
  useSendEmailVerificationOtpMutation,
  useVerifyEmailVerificationOtpMutation,
  useLoginMutation,
  useGetMeQuery,
  useSendPasswordResetOtpMutation,
  useVerifyPasswordResetOtpMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
  useGetPublicProfileQuery,
} = portfolioApi;
