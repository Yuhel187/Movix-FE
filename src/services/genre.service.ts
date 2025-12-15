import apiClient from "@/lib/apiClient";

export interface Genre {
  id: string;
  name: string;
  _count?: {
    movie_genres: number;
  };
}

export interface CreateGenreDto {
  name: string;
}

export interface UpdateGenreDto {
  name: string;
}

export const genreService = {
  getAll: async () => {
    const response = await apiClient.get<Genre[]>("/genres");
    return response.data;
  },

  create: async (data: CreateGenreDto) => {
    const response = await apiClient.post<Genre>("/genres", data);
    return response.data;
  },

  update: async (id: string, data: UpdateGenreDto) => {
    const response = await apiClient.put<Genre>(`/genres/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/genres/${id}`);
  },
};