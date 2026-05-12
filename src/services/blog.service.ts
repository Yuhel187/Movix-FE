import apiClient from "@/lib/apiClient";

export interface GetAllBlogsParams {
  page?: number;
  limit?: number;
  movieId?: string;
  userId?: string;
  isSpoiler?: boolean | string;
  search?: string;
}

export interface GetSavedBlogsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const blogService = {
  getAllBlogs: async (params?: GetAllBlogsParams) => {
    const response = await apiClient.get("/blogs", { params });
    return response.data;
  },

  getSavedBlogs: async (params?: GetSavedBlogsParams) => {
    const response = await apiClient.get("/blogs/bookmarks", { params });
    return response.data;
  },

  getBlogBySlug: async (slug: string) => {
    const response = await apiClient.get(`/blogs/slug/${slug}`);
    return response.data;
  },

  createBlogPost: async (formData: FormData) => {
    const response = await apiClient.post("/blogs", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
