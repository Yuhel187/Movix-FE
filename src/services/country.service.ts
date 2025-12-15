import apiClient from "@/lib/apiClient";

export interface Country {
  id: string;
  name: string;
  _count?: {
    movies: number; 
  };
}

export interface CreateCountryDto {
  name: string;
}

export interface UpdateCountryDto {
  name: string;
}

export const countryService = {
  // Lấy tất cả quốc gia
  getAll: async () => {
    const response = await apiClient.get<Country[]>("/countries");
    return response.data;
  },

  // Tạo quốc gia mới
  create: async (data: CreateCountryDto) => {
    const response = await apiClient.post<Country>("/countries", data);
    return response.data;
  },

  // Cập nhật quốc gia
  update: async (id: string, data: UpdateCountryDto) => {
    const response = await apiClient.put<Country>(`/countries/${id}`, data);
    return response.data;
  },

  // Xóa quốc gia
  delete: async (id: string) => {
    await apiClient.delete(`/countries/${id}`);
  },
};