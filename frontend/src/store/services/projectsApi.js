import { apiSlice } from "./apiSlice";

export const projectsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: () => "/projects",
      providesTags: ["Project"],
    }),
    getProject: builder.query({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: "Project", id }],
    }),
    addProject: builder.mutation({
      query: (project) => ({
        url: "/projects",
        method: "POST",
        body: project,
      }),
      invalidatesTags: ["Project"],
    }),
    updateProject: builder.mutation({
      query: ({ id, ...project }) => ({
        url: `/projects/${id}`,
        method: "PUT",
        body: project,
      }),
      invalidatesTags: ["Project"],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/projects/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          projectsApi.util.updateQueryData(
            "getProjects",
            undefined,
            (draft) => {
              // draft is the array data returned by the backend
              if (draft?.data) {
                draft.data = draft.data.filter(
                  (project) => String(project._id) !== String(id),
                );
              } else if (Array.isArray(draft)) {
                return draft.filter(
                  (project) => String(project._id) !== String(id),
                );
              }
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ["Project"],
    }),
    updateDeleteStatus: builder.mutation({
      query: (id) => ({
        url: `/projects/delete-status/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Project"],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useAddProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useUpdateDeleteStatusMutation,
} = projectsApi;
