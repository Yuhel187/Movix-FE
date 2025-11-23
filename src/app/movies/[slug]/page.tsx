import MovieHero from "@/components/movie/MovieHero";
import Navbar from "@/components/layout/NavBar";
import { getMovieData } from "@/services/movie.service"; 
import MovieSharedLayout from "@/components/movie/MovieSharedLayout"; 

export default async function MovieDetailPage({ params }: { params: { slug: string } }) {
  const { movie, sidebarData } = await getMovieData(params.slug);

  return (
    <main className="dark min-h-screen bg-black text-white">
      <div className="absolute top-0 left-0 w-full z-20">
        <Navbar />
      </div>
      <MovieHero movie={movie} />
      
      <MovieSharedLayout 
        castData={movie.cast || []} 
        sidebarData={sidebarData} 
        movieId={movie.id as string}
        movieSlug={movie.slug}
        seasons={movie.seasons}   
        type={movie.type}         
      />
    </main>
  );
}