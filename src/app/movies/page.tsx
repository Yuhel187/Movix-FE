'use client';

import { useEffect, useState } from "react";
import HeroBanner from "@/components/movie/HeroBanner";
import { MovieCarousel } from "@/components/movie/MovieCarousel";
import { GenreSection } from "@/components/movie/GenreSection";
import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import AIChatWidget from "@/components/ai/AIChatWidget";
import {
  getTrendingMovies,
  getDynamicSections,
  getPersonalizedMovies,
  getGenres,
  MovieSection
} from "@/services/movie.service";
import { getBanners } from "@/services/banner.service";
import type { Movie, Genre } from "@/types/movie";
import type { Banner } from "@/types/banner";
import { Loader2 } from "lucide-react";

export default function MoviesPage() {
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [sections, setSections] = useState<MovieSection[]>([]);
  const [personalizedMovies, setPersonalizedMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [trending, dynamicSections, personalized, bannersData, genresList] = await Promise.all([
          getTrendingMovies(),
          getDynamicSections(),
          getPersonalizedMovies(),
          getBanners(),
          getGenres()
        ]);

        setHeroMovies(trending.slice(0, 10));
        setSections(dynamicSections);
        setPersonalizedMovies(personalized);
        setBanners(bannersData);
        setGenres(genresList);

      } catch (error) {
        console.error("Lỗi tải trang:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <main className="dark min-h-screen bg-black">
      <Navbar />

      {banners.length > 0 && (
        <section className="w-full h-screen">
          <HeroBanner banners={banners} />
        </section>
      )}

      <div className="flex flex-col gap-8 pb-20 mt-8 relative z-10 px-4 md:px-0">

        {/* Genre Section */}
        <GenreSection genres={genres} />

        {personalizedMovies.length > 0 && (
          <MovieCarousel
            title="Dành riêng cho bạn"
            movies={personalizedMovies}
          />
        )}
        {sections.length === 0 && heroMovies.length > 0 && (
          <MovieCarousel title="Phim Thịnh Hành" movies={heroMovies} />
        )}
        {sections.map((section) => (
          section.movies.length > 0 && (
            <MovieCarousel
              key={section.id}
              title={section.title}
              movies={section.movies}
            />
          )
        ))}
      </div>
      <Footer />
      <AIChatWidget />
    </main>
  );
}