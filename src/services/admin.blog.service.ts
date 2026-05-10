import api from '@/lib/apiClient';
import { BlogPaginationResponse, BlogPost, PostStatus } from '@/types/blog';

export interface GetBlogsParams {
  page?: number;
  take?: number;
  search?: string;
  status?: string;
}

export const adminBlogService = {
  getAllBlogs: async (params?: GetBlogsParams): Promise<BlogPaginationResponse> => {
    const response = await api.get('/admin/blogs/get-all', { params });
    return response.data.result;
  },

  getBlogDetail: async (id: string): Promise<BlogPost> => {
    const response = await api.get(`/admin/blogs/get-blog/${id}`);
    return response.data.result;
  },

  updateBlogStatus: async (id: string, status: PostStatus): Promise<BlogPost> => {
    const response = await api.put(`/admin/blogs/update-blog-status/${id}`, { status });
    return response.data.result;
  },
};
