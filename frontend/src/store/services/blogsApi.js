import { apiSlice } from "./apiSlice";

export const blogsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBlogs: builder.query({
      query: () => "/blogs",
      providesTags: ["Blog"],
    }),
    getBlog: builder.query({
      query: (id) => `/blogs/${id}`,
      providesTags: (result, error, id) => [{ type: "Blog", id }],
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
      async onQueryStarted({ id, email }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          blogsApi.util.updateQueryData("getBlog", id, (draft) => {
            const blog = draft.data;
            if (blog && blog.likes) {
              const index = blog.likes.indexOf(email);
              if (index === -1) {
                blog.likes.push(email);
              } else {
                blog.likes.splice(index, 1);
              }
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: "Blog", id }],
    }),
    getComments: builder.query({
      query: (id) => `/blogs/${id}/comments`,
      providesTags: (result, error, id) => [{ type: "Comment", id }],
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
      async onQueryStarted(
        { commentId, email, blogId },
        { dispatch, queryFulfilled },
      ) {
        const patchResult = dispatch(
          blogsApi.util.updateQueryData("getComments", blogId, (draft) => {
            const comment = draft.data?.find((c) => c._id === commentId);
            if (comment && comment.likes) {
              const index = comment.likes.indexOf(email);
              if (index === -1) {
                comment.likes.push(email);
              } else {
                comment.likes.splice(index, 1);
              }
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
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
