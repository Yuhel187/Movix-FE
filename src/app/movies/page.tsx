'use client';

import { useEffect, useState } from "react";
import HeroBanner from "@/components/movie/HeroBanner";
import { MovieCarousel } from "@/components/movie/MovieCarousel";
import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import AIChatWidget from "@/components/ai/AIChatWidget";
import {
  getTrendingMovies,
  getDynamicSections,
  getPersonalizedMovies,
  MovieSection
} from "@/services/movie.service";
import { getBanners } from "@/services/banner.service";
import type { Movie } from "@/types/movie";
import type { Banner } from "@/types/banner"; 
import { Loader2 } from "lucide-react";

export default function MoviesPage() {
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]); 
  const [banners, setBanners] = useState<Banner[]>([]);      
  const [sections, setSections] = useState<MovieSection[]>([]);
  const [personalizedMovies, setPersonalizedMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [trending, dynamicSections, personalized, bannersData] = await Promise.all([
          getTrendingMovies(),
          getDynamicSections(),
          getPersonalizedMovies(),
          getBanners()
        ]);

        setHeroMovies(trending.slice(0, 10)); 
        setSections(dynamicSections);
        setPersonalizedMovies(personalized);
        setBanners(bannersData); 

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

      <div className="flex flex-col gap-8 pb-20">
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