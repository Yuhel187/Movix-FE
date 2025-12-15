/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/apiClient";
import type { 
  Person, 
  PeopleListResponse, 
  PersonDetailResponse 
} from "@/types/person";
import { getPersonAvatarUrl, getTmdbImageUrl } from "@/lib/tmdb";

function getRoleDisplayName(roleType?: string) {
    const r = roleType?.toLowerCase()?.trim();
    if (r === 'director') return "Đạo diễn";
    if (r === 'actor') return "Diễn viên";
    if (r === 'writer') return "Biên kịch";
    return "Nghệ sĩ";
}

export async function getPeopleList(page = 1, limit = 20) {
  try {
    const res = await api.get<PeopleListResponse>(`/people?page=${page}&limit=${limit}`);
    const rawData = res.data;

    const people: Person[] = rawData.data.map((item) => ({
      id: item.id,
      name: item.name,
      avatarUrl: getPersonAvatarUrl(item.avatar_url),
      role: getRoleDisplayName(item.role_type), 
    }));

    return { 
      people, 
      totalPages: rawData.pagination.totalPages 
    };

  } catch (error) {
    console.error("Lỗi lấy danh sách diễn viên:", error);
    return { people: [], totalPages: 0 };
  }
}

export async function getPersonDetail(id: string) {
  try {
    const res = await api.get<PersonDetailResponse>(`/people/${id}`);
    const raw = res.data;

    const credits = raw.movies?.map((m) => ({
       id: m.id,
       title: m.title,
       posterUrl: getTmdbImageUrl(m.poster_url, "poster"),
       roleName: m.credit_type === "cast" 
          ? (m.character || "Diễn viên") 
          : (m.job || "Thành viên đoàn"),
       year: m.release_date ? new Date(m.release_date).getFullYear().toString() : "N/A",
       slug: m.slug
    })) || [];

    credits.sort((a, b) => (b.year === "N/A" ? -1 : parseInt(b.year) - parseInt(a.year)));

    const person: Person = {
      id: raw.id,
      name: raw.name,
      avatarUrl: getPersonAvatarUrl(raw.avatar_url),
      role: getRoleDisplayName(raw.role_type), 
      biography: raw.biography || "Chưa có tiểu sử.",
      birthday: raw.birthday ? new Date(raw.birthday).toLocaleDateString("vi-VN") : "N/A",
      gender: raw.gender,
      credits: credits
    };

    return person;
  } catch (error) {
    console.error("Lỗi lấy chi tiết diễn viên:", error);
    throw new Error("Không tìm thấy diễn viên");
  }
}

export interface AdminPerson {
    id: string;
    name: string;
    role_type: string; 
    gender: number;
    avatar_url?: string;
    birthday?: string;
    biography?: string;
    _count?: {
        movie_people: number;
    };
}

export interface AdminPersonListResponse {
    data: AdminPerson[]; 
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }
}

export const personService = {
  getAll: async (params?: { search?: string; role_type?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);
    if (params?.role_type && params.role_type !== 'all') query.append("role_type", params.role_type);

    const response = await api.get<AdminPersonListResponse>(`/people?${query.toString()}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/people", data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/people/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/people/${id}`);
  },
};