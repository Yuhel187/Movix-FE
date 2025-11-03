'use client';
import { useState } from "react";
import { MovieCard } from "@/components/movie/MovieCard";
import { PlaylistItemCard } from "@/components/account/PlaylistItem";
import type { Movie } from "@/types/movie";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const mockPlaylists = [
  { id: 1, title: "PlayList1", movieCount: 8 },
  { id: 2, title: "Phim Hành Động", movieCount: 12 },
  { id: 3, title: "Xem Sau", movieCount: 5 },
  { id: 4, title: "Kinh Dị", movieCount: 20 },
];

const mockMovies: Movie[] = [
  {
    id: 1,
    title: "Avengers: Endgame",
    subTitle: "Hồi kết của Avengers",
    posterUrl: "https://image.tmdb.org/t/p/w500/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    description:
      "Sau khi Thanos xóa sổ nửa vũ trụ, những anh hùng còn lại phải tìm cách đảo ngược thảm họa và cứu lấy thế giới.",
    year: 2019,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    tags: ["Hành động", "Khoa học viễn tưởng", "Si`êu anh hùng"],
    rating: 9.0,
    duration: "3h 2m",
    country: "Mỹ",
    views: 12000000,
  },
  {
    id: 2,
    title: "John Wick 4",
    subTitle: "Chương cuối của sát thủ huyền thoại",
    posterUrl: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    description:
      "John Wick đối đầu với Hội Bàn Tròn trong trận chiến sinh tử để giành lại tự do của mình.",
    year: 2023,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    tags: ["Hành động", "Tội phạm", "Hồi hộp"],
    rating: 8.7,
    duration: "2h 49m",
    country: "Mỹ",
    views: 8900000,
  },
  {
    id: 3,
    title: "Demon Slayer: Mugen Train",
    subTitle: "Thanh gươm diệt quỷ - Chuyến tàu vô tận",
    posterUrl: "https://image.tmdb.org/t/p/w500/h8Rb9gBr48ODIwYUttZNYeMWeUU.jpg",
    description:
      "Tanjiro và đồng đội cùng Rengoku điều tra một chuỗi vụ mất tích bí ẩn trên chuyến tàu vô tận.",
    year: 2020,
    type: "Anime Movie",
    episode: "Full HD",
    tags: ["Anime", "Hành động", "Phiêu lưu"],
    rating: 8.6,
    duration: "1h 57m",
    country: "Nhật Bản",
    views: 7600000,
  },
  {
    id: 4,
    title: "Interstellar",
    subTitle: "Cuộc du hành xuyên không gian",
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    description:
      "Một nhóm phi hành gia vượt qua lỗ sâu để tìm kiếm hành tinh có thể sinh sống cho loài người.",
    year: 2014,
    type: "Phim khoa học viễn tưởng",
    episode: "Full HD",
    tags: ["Sci-Fi", "Phiêu lưu", "Tâm lý"],
    rating: 8.9,
    duration: "2h 49m",
    country: "Mỹ",
    views: 10400000,
  },
  {
    id: 5,
    title: "Demon Slayer: Mugen Train",
    subTitle: "Thanh gươm diệt quỷ - Chuyến tàu vô tận",
    posterUrl: "https://image.tmdb.org/t/p/w500/h8Rb9gBr48ODIwYUttZNYeMWeUU.jpg",
    description:
      "Tanjiro và đồng đội cùng Rengoku điều tra một chuỗi vụ mất tích bí ẩn trên chuyến tàu vô tận.",
    year: 2020,
    type: "Anime Movie",
    episode: "Full HD",
    tags: ["Anime", "Hành động", "Phiêu lưu"],
    rating: 8.6,
    duration: "1h 57m",
    country: "Nhật Bản",
    views: 7600000,
  },
  {
    id: 6,
    title: "Interstellar",
    subTitle: "Cuộc du hành xuyên không gian",
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    description:
      "Một nhóm phi hành gia vượt qua lỗ sâu để tìm kiếm hành tinh có thể sinh sống cho loài người.",
    year: 2014,
    type: "Phim khoa học viễn tưởng",
    episode: "Full HD",
    tags: ["Sci-Fi", "Phiêu lưu", "Tâm lý"],
    rating: 8.9,
    duration: "2h 49m",
    country: "Mỹ",
    views: 10400000,
  },
   {
    id: 7,
    title: "Avengers: Endgame",
    subTitle: "Hồi kết của Avengers",
    posterUrl: "https://image.tmdb.org/t/p/w500/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    description:
      "Sau khi Thanos xóa sổ nửa vũ trụ, những anh hùng còn lại phải tìm cách đảo ngược thảm họa và cứu lấy thế giới.",
    year: 2019,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    tags: ["Hành động", "Khoa học viễn tưởng", "Siêu anh hùng"],
    rating: 9.0,
    duration: "3h 2m",
    country: "Mỹ",
    views: 12000000,
  },
  {
    id: 8,
    title: "John Wick 4",
    subTitle: "Chương cuối của sát thủ huyền thoại",
    posterUrl: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    description:
      "John Wick đối đầu với Hội Bàn Tròn trong trận chiến sinh tử để giành lại tự do của mình.",
    year: 2023,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    tags: ["Hành động", "Tội phạm", "Hồi hộp"],
    rating: 8.7,
    duration: "2h 49m",
    country: "Mỹ",
    views: 8900000,
  },
];

export default function PlaylistPage() {
    const [activePlaylistId, setActivePlaylistId] = useState(mockPlaylists[0].id);
    return (
        <div className=" max-w-6xl space-y-8">
            <h1 className="text-3xl font-bold text-white">Danh sách phát</h1>
            <div className="flex items-center gap-4">
              <div className="flex-1 flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {mockPlaylists.map((playlist) => (
                  <PlaylistItemCard
                    key={playlist.id}
                    title={playlist.title}
                    movieCount={playlist.movieCount}
                    isActive={playlist.id === activePlaylistId}
                    onClick={() => setActivePlaylistId(playlist.id)}
                  />
                ))}
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white flex-shrink-0">
                <ArrowRight className="h-6 w-6" />
              </Button>
            </div>
            {mockMovies.length === 0 ? (
                <p className="text-gray-400">Playlist này trống.</p>
            ) : (
                <div className="dark grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {mockMovies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            )}
        </div>
    );
}