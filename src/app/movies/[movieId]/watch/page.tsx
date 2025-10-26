"use client";
import Navbar from "@/components/layout/NavBar";
import VideoPlayer from "@/components/movie/VideoPlayer";
import MovieCast from "@/components/movie/MovieCast";
import type { Actor } from "@/types/actor";

const castData: Actor[] = [
  { id: 1, name: "Matthew McConaughey", character: "Cooper", profileUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/lCySuYjhXix3FzQdS4oceDDrXKI.jpg" },
  { id: 2, name: "Anne Hathaway", character: "Brand", profileUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/lCySuYjhXix3FzQdS4oceDDrXKI.jpg" },
  { id: 3, name: "Michael Caine", character: "Professor Brand", profileUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/lCySuYjhXix3FzQdS4oceDDrXKI.jpg" },
  { id: 4, name: "Casey Affleck", character: "Tom Cooper", profileUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/lCySuYjhXix3FzQdS4oceDDrXKI.jpg" },
  { id: 5, name: "Matt Damon", character: "Dr. Mann", profileUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/lCySuYjhXix3FzQdS4oceDDrXKI.jpg" },
  { id: 6, name: "John Lithgow", character: "Donald", profileUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/lCySuYjhXix3FzQdS4oceDDrXKI.jpg" },
  { id: 7, name: "Mackenzie Foy", character: "Young Murph", profileUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/lCySuYjhXix3FzQdS4oceDDrXKI.jpg" },
  { id: 8, name: "Jessica Chastain", character: "Murphy Cooper", profileUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/lCySuYjhXix3FzQdS4oceDDrXKI.jpg" },
];

export default function MovieWatchPage() {
  return (
    <main className="dark min-h-screen bg-black text-white flex flex-col items-center">
      <div className="w-full fixed top-0 left-0 z-50 bg-black/70 backdrop-blur-md">
        <Navbar />
      </div>

      <section className="pt-20 w-full max-w-6xl px-4">
        <VideoPlayer src="https://vip.opstream11.com/20230406/43186_90fd88e0/index.m3u8" 
        poster="https://image.tmdb.org/t/p/original/wIW7PQ0vNeBC4lvBTo6Yc6126HU.jpg"/>
      </section>

      <section className="w-full max-w-6xl px-6 mt-10 mb-20">
        <h2 className="text-2xl font-semibold mb-4">Diễn viên</h2>
        <MovieCast cast={castData} />
      </section>
    </main>
  );
}
