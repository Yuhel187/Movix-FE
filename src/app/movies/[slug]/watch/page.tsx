import Navbar from "@/components/layout/NavBar";
import VideoPlayer from "@/components/movie/VideoPlayer";
import { getMovieData } from "@/services/movie.service";
import MovieSharedLayout from "@/components/movie/MovieSharedLayout";

export default async function MovieWatchPage({ params }: { params: { slug: string } }) {
  const { movie, castData, sidebarData } = await getMovieData(params.slug);
  console.log("Movie Watch Data:", movie.videoUrl);

  return (
    <main className="dark min-h-screen bg-black text-white">
      <div className="absolute top-0 left-0 w-full z-20">
        <Navbar />
      </div>
      <section
        className="pt-20 w-full max-w-6xl px-4 mx-auto flex justify-center"
      >
        <VideoPlayer
          src={movie.videoUrl || ""}

          poster={movie.posterUrl || "https://www.coengoedegebure.com/content/images/2017/08/default404.gif"}
        />
      </section>

      <MovieSharedLayout
        castData={castData}
        sidebarData={sidebarData}
        movieId={movie.id as string}
      />
    </main>
  );
}