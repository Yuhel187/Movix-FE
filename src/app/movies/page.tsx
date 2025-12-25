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
import { HeroSkeleton } from "@/components/skeletons/HeroSkeleton";
import { GenreSkeleton } from "@/components/skeletons/GenreSkeleton";
import { MovieCarouselSkeleton } from "@/components/skeletons/MovieCarouselSkeleton";

export default function MoviesPage() {
  const [banners, setBanners] = useState<Banner[] | null>(null);
  const [heroMovies, setHeroMovies] = useState<Movie[] | null>(null);
  const [genres, setGenres] = useState<Genre[] | null>(null);
  const [personalizedMovies, setPersonalizedMovies] = useState<Movie[] | null>(null);
  const [sections, setSections] = useState<MovieSection[] | null>(null);

  useEffect(() => {
    // 1. Critical High-Priority Data (Banners & Genres)
    const loadCriticalData = async () => {
      try {
        const [bannersData, genresList] = await Promise.all([
          getBanners(),
          getGenres()
        ]);
        setBanners(bannersData);
        setGenres(genresList);
      } catch (error) {
        console.error("Failed to load critical data:", error);
      }
    };
    const loadSecondaryData = async () => {
      try {
        const [trending, dynamicWithMovies] = await Promise.all([
          getTrendingMovies(),
          getDynamicSections()
        ]);
        setHeroMovies(trending.slice(0, 10));
        setSections(dynamicWithMovies);
      } catch (error) {
        console.error("Failed to load secondary data:", error);
      }
    };

    const loadPersonalized = async () => {
      try {
        const personalized = await getPersonalizedMovies();
        setPersonalizedMovies(personalized);
      } catch (error) {
        console.error("Failed to load personalized movies:", error);
        setPersonalizedMovies([]); 
      }
    };

    loadCriticalData();
    loadSecondaryData();
    loadPersonalized();

  }, []);

  return (
    <main className="dark min-h-screen bg-black">
      <Navbar />

      {/* Hero Banner Section */}
      <section className="w-full">
        {banners === null ? (
          <HeroSkeleton />
        ) : banners.length > 0 ? (
          <HeroBanner banners={banners} />
        ) : null}
      </section>

      <div className="flex flex-col gap-8 pb-20 mt-8 relative z-10 px-4 md:px-0">

        {/* Genre Section */}
        {genres === null ? (
          <GenreSkeleton />
        ) : (
          <GenreSection genres={genres} />
        )}

        {/* Personalized Movies (Heaviest) */}
        {personalizedMovies === null ? (
          <MovieCarouselSkeleton />
        ) : personalizedMovies.length > 0 ? (
          <MovieCarousel
            title="Dành riêng cho bạn"
            movies={personalizedMovies}
          />
        ) : null}

        {/* Trending Movies */}
        {heroMovies === null ? (
          <MovieCarouselSkeleton />
        ) : heroMovies.length > 0 && sections?.length === 0 ? (
          <MovieCarousel title="Phim Thịnh Hành" movies={heroMovies} />
        ) : null}

        {/* Dynamic Sections */}
        {sections === null ? (
          <>
            <MovieCarouselSkeleton />
            <MovieCarouselSkeleton />
          </>
        ) : (
          sections.map((section) => (
            section.movies.length > 0 && (
              <MovieCarousel
                key={section.id}
                title={section.title}
                movies={section.movies}
              />
            )
          ))
        )}
      </div>
      <Footer />
    </main>
  );
}