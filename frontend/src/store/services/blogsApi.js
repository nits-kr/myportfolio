import { apiSlice } from "./apiSlice";

export const blogsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getBlogs: builder.query({
      query: (params) => {
        if (!params) return "/blogs";
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page);
        if (params.limit) queryParams.append("limit", params.limit);
        if (params.search) queryParams.append("search", params.search);
        if (params.excludeId) queryParams.append("excludeId", params.excludeId);

        const queryString = queryParams.toString();
        return queryString ? `/blogs?${queryString}` : "/blogs";
      },
      providesTags: ["Blog"],
    }),
    getBlog: builder.query({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        const viewerEmail = typeof arg === "object" ? arg.viewerEmail : null;
        const email =
          viewerEmail ||
          (typeof window !== "undefined"
            ? localStorage.getItem("blogSubscriberEmail")
            : null);
        return {
          url: `/blogs/${id}`,
          params: email ? { viewerEmail: email } : {},
        };
      },
      providesTags: (result, error, arg) => [
        { type: "Blog", id: typeof arg === "string" ? arg : arg.id },
      ],
    }),
    addBlog: builder.mutation({
      query: (blog) => ({
        url: "/blogs",
        method: "POST",
        body: blog,
      }),
      invalidatesTags: ["Blog"],
    }),
    updateBlog: builder.mutation({
      query: ({ id, ...blog }) => ({
        url: `/blogs/${id}`,
        method: "PUT",
        body: blog,
      }),
      invalidatesTags: ["Blog"],
    }),
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        // Optimistic update for empty args (default list)
        const patchResult = dispatch(
          blogsApi.util.updateQueryData("getBlogs", undefined, (draft) => {
            if (draft?.data?.blogs) {
              draft.data.blogs = draft.data.blogs.filter(
                (blog) => String(blog._id) !== String(id),
              );
            } else if (draft?.data && Array.isArray(draft.data)) {
              draft.data = draft.data.filter(
                (blog) => String(blog._id) !== String(id),
              );
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ["Blog"],
    }),
    updateBlogDeleteStatus: builder.mutation({
      query: (id) => ({
        url: `/blogs/delete-status/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Blog"],
    }),
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: "/upload",
        method: "POST",
        body: formData,
      }),
    }),
    subscribe: builder.mutation({
      query: (data) => ({
        url: "/subscribers",
        method: "POST",
        body: data,
      }),
    }),
    likeBlog: builder.mutation({
      query: ({ id, email }) => ({
        url: `/blogs/${id}/like`,
        method: "POST",
        body: { email },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Blog", id }],
    }),
    getComments: builder.query({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        const viewerEmail = typeof arg === "object" ? arg.viewerEmail : null;
        const email =
          viewerEmail ||
          (typeof window !== "undefined"
            ? localStorage.getItem("blogSubscriberEmail")
            : null);
        return {
          url: `/blogs/${id}/comments`,
          params: email ? { viewerEmail: email } : {},
        };
      },
      providesTags: (result, error, arg) => [
        { type: "Comment", id: typeof arg === "string" ? arg : arg.id },
      ],
    }),
    addComment: builder.mutation({
      query: ({ id, ...comment }) => ({
        url: `/blogs/${id}/comments`,
        method: "POST",
        body: comment,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Comment", id }],
    }),
    likeComment: builder.mutation({
      query: ({ commentId, email }) => ({
        url: `/blogs/comments/${commentId}/like`,
        method: "POST",
        body: { email },
      }),
      invalidatesTags: (result, error, { blogId }) => [
        { type: "Comment", id: blogId },
      ],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetBlogQuery,
  useAddBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useUpdateBlogDeleteStatusMutation,
  useUploadImageMutation,
  useSubscribeMutation,
  useLikeBlogMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useLikeCommentMutation,
} = blogsApi;
