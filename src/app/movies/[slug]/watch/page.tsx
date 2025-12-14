import Navbar from "@/components/layout/NavBar";
import { getMovieData } from "@/services/movie.service"; 
import WatchContainer from "@/components/movie/WatchContainer";

export default async function MovieWatchPage({ params }: { params: { slug: string } }) {
  const { movie, sidebarData } = await getMovieData(params.slug);

  return (
    <main className="dark min-h-screen bg-black text-white">
      <div className="absolute top-0 left-0 w-full z-20">
        <Navbar />
      </div>
      <WatchContainer movie={movie} sidebarData={sidebarData} />
    </main>
  );
}