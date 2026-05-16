import apiClient from '@/lib/apiClient';
import type { Movie } from '@/types/movie';

export interface MoodContext {
  hour: number;
  dayOfWeek: number;
  topGenres: string[];
  signal: string;
}

export interface MoodData {
  mood: string;
  label: string;
  emoji: string;
  description: string;
  movies: Movie[];
  context: MoodContext;
  expires_at: string;
  playlist_id: string;
  cached?: boolean;
}

export interface MoodResponse {
  success: boolean;
  data: MoodData;
}

export const getMoodDetect = async (): Promise<MoodResponse> => {
  const response = await apiClient.get<MoodResponse>('/mood/detect');
  return response.data;
};

export const getMoodSuggest = async (mood: string, limit?: number): Promise<MoodResponse> => {
  const response = await apiClient.post<MoodResponse>('/mood/suggest', { mood, limit });
  return response.data;
};
