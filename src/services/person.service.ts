import api from "@/lib/apiClient";
import type { 
  Person, 
  PeopleListResponse, 
  PersonDetailResponse 
} from "@/types/person";
import { getPersonAvatarUrl, getTmdbImageUrl } from "@/lib/tmdb";

export async function getPeopleList(page = 1, limit = 20) {
  try {
    const res = await api.get<PeopleListResponse>(`/people?page=${page}&limit=${limit}`);
    const rawData = res.data;

    const people: Person[] = rawData.data.map((item) => ({
      id: item.id,
      name: item.name,
      avatarUrl: getPersonAvatarUrl(item.avatar_url),
      role: item.role_type === "director" ? "Đạo diễn" : "Diễn viên",
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
    // let genderStr = "N/A";
    // if (raw.gender === 2) genderStr = "Nam";
    // else if (raw.gender === 1) genderStr = "Nữ";

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
      role: raw.role_type === "director" ? "Đạo diễn" : "Diễn viên",
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