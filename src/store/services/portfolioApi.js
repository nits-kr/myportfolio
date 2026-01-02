import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a service using a base URL and expected endpoints
export const portfolioApi = createApi({
    reducerPath: 'portfolioApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getProjects: builder.query({
            query: () => 'projects',
        }),
        // can add more endpoints here, e.g., getAbout, submitContact etc.
    }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetProjectsQuery } = portfolioApi;
