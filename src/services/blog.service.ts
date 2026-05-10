import apiClient from "@/lib/apiClient";

export interface GetAllBlogsParams {
  page?: number;
  limit?: number;
  movieId?: string;
  userId?: string;
  isSpoiler?: boolean | string;
  search?: string;
}

export const blogService = {

  getAllBlogs: async (params?: GetAllBlogsParams) => {
    const response = await apiClient.get("/blogs", { params });
    return response.data;
  },

  getBlogById: async (id: string) => {
    const response = await apiClient.get(`/blogs/id/${id}`);
    return response.data;
  },


  getBlogBySlug: async (slug: string) => {
    const response = await apiClient.get(`/blogs/slug/${slug}`);
    return response.data;
  },

  getUserBlogs: async (userId: string, params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get(`/blogs/user/${userId}`, { params });
    return response.data;
  },


  createBlogPost: async (formData: FormData) => {
    const response = await apiClient.post("/blogs", formData, {
      headers: { "Content-Type": undefined }, // để axios tự set multipart boundary
    });
    return response.data;
  },

  updateBlogPost: async (id: string, formData: FormData) => {
    const response = await apiClient.put(`/blogs/${id}`, formData, {
      headers: { "Content-Type": undefined }, // để axios tự set multipart boundary
    });
    return response.data;
  },


  deleteBlogPost: async (id: string) => {
    const response = await apiClient.delete(`/blogs/${id}`);
    return response.data;
  },

  toggleLike: async (id: string) => {
    const response = await apiClient.post(`/blogs/${id}/like`);
    return response.data;
  },

  toggleBookmark: async (id: string) => {
    const response = await apiClient.post(`/blogs/${id}/bookmark`);
    return response.data;
  },
};
