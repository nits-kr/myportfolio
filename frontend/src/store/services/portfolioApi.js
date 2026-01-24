import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a service using a base URL and expected endpoints
export const portfolioApi = createApi({
    reducerPath: 'portfolioApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5000/api',
        prepareHeaders: (headers) => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getProjects: builder.query({
            query: () => 'projects',
        }),
        register: builder.mutation({
            query: (userData) => ({
                url: 'auth/register',
                method: 'POST',
                body: userData,
            }),
        }),
        login: builder.mutation({
            query: (userData) => ({
                url: 'auth/login',
                method: 'POST',
                body: userData,
            }),
        }),
        getMe: builder.query({
            query: () => 'auth/me',
        }),
        // can add more endpoints here, e.g., getAbout, submitContact etc.
    }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetProjectsQuery, useRegisterMutation, useLoginMutation, useGetMeQuery } = portfolioApi;
