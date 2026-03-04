/**
 * portfolioApi.js
 *
 * Auth and profile endpoints injected into the offline-aware apiSlice.
 * All mutations now automatically benefit from:
 * - WAL queuing when offline
 * - In-flight error staging
 * - Sync-on-reconnect via syncService
 */
import { apiSlice } from "./apiSlice";

export const portfolioApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
    }),
    sendEmailVerificationOtp: builder.mutation({
      query: (data) => ({
        url: "/auth/email-verification/send-otp",
        method: "POST",
        body: data,
      }),
    }),
    verifyEmailVerificationOtp: builder.mutation({
      query: (data) => ({
        url: "/auth/email-verification/verify-otp",
        method: "POST",
        body: data,
      }),
    }),
    login: builder.mutation({
      query: (userData) => ({
        url: "/auth/login",
        method: "POST",
        body: userData,
      }),
    }),
    sendPasswordResetOtp: builder.mutation({
      query: (data) => ({
        url: "/auth/password-reset/send-otp",
        method: "POST",
        body: data,
      }),
    }),
    verifyPasswordResetOtp: builder.mutation({
      query: (data) => ({
        url: "/auth/password-reset/verify-otp",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/password-reset/reset",
        method: "POST",
        body: data,
      }),
    }),
    getMe: builder.query({
      query: () => ({ url: "/auth/me", method: "GET" }),
    }),
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: "/auth/profile",
        method: "PUT",
        body: userData,
      }),
    }),
    getPublicProfile: builder.query({
      query: () => ({ url: "/auth/profile/public", method: "GET" }),
    }),
  }),
  overrideExisting: true,
});

export const {
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
