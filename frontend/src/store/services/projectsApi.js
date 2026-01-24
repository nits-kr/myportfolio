import { apiSlice } from './apiSlice';

export const projectsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProjects: builder.query({
            query: () => '/projects',
            providesTags: ['Project']
        }),
        addProject: builder.mutation({
            query: (project) => ({
                url: '/projects',
                method: 'POST',
                body: project
            }),
            invalidatesTags: ['Project']
        }),
        updateProject: builder.mutation({
            query: ({ id, ...project }) => ({
                url: `/projects/${id}`,
                method: 'PUT',
                body: project
            }),
            invalidatesTags: ['Project']
        }),
        deleteProject: builder.mutation({
            query: (id) => ({
                url: `/projects/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Project']
        })
    })
});

export const {
    useGetProjectsQuery,
    useAddProjectMutation,
    useUpdateProjectMutation,
    useDeleteProjectMutation
} = projectsApi;
