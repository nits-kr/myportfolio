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
