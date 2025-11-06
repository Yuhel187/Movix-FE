import apiClient from '@/lib/apiClient';
import { Movie } from '@/types/movie'; //

export interface Playlist {
  id: string;
  name: string;
  user_id: string;
  _count?: { 
    playlist_movies: number;
  };
}

export const toggleFavorite = async (movieId: string) => {
  const response = await apiClient.post('/interact/favorite/toggle', { movieId });
  return response.data; 
};

export const checkFavoriteStatus = async (movieId: string) => {
  const response = await apiClient.get('/interact/favorite/status', {
    params: { movieId },
  });
  return response.data; 
};

export const getFavoriteMovies = async (): Promise<Movie[]> => {
  const response = await apiClient.get('/interact/favorites');
  return response.data;
};

export const getPlaylists = async (): Promise<Playlist[]> => {
  const response = await apiClient.get('/interact/playlists');
  return response.data;
};

export const createPlaylist = async (name: string): Promise<Playlist> => {
  const response = await apiClient.post('/interact/playlist/create', { name });
  return response.data;
};

export const addMovieToPlaylist = async (
  playlistId: string,
  movieId: string,
) => {
  const response = await apiClient.post('/interact/playlist/add', {
    playlistId,
    movieId,
  });
  return response.data;
};