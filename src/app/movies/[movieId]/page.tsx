import MovieHero from "@/components/movie/MovieHero";
import Navbar from "@/components/layout/NavBar";
import type { Movie } from "@/types/movie";
import type { Actor } from "@/types/actor";
import MovieCast from "@/components/movie/MovieCast";
import  {MovieCommentSection}  from "@/components/comment/MovieCommentSection";
import Footer from "@/components/layout/Footer";

const movieData: Movie = {
    id: "interstellar",
    title: "Giữa Các Vì Sao",
    subTitle: "Interstellar",
    description: "A fiery young man clashes with an unflinching forest officer in a south Indian village where spirituality, fate and folklore rule the lands.",
    posterUrl: "https://image.tmdb.org/t/p/original/if4TI9LbqNIrzkoOgWjX5PZYDYe.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/9REO1DLpmwhrBJY3mYW5eVxkXFM.jpg",
    tags: ["T18", "Hình sự", "Khoa học", "Tâm lý"],
};
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

// params: { movieId: string } 
export default function MovieDetailPage() {
    // const movie = await getMovieById(params.movieId);
    const movie = movieData;

    return (
        <main className="dark min-h-screen bg-black text-white">
            <div className="absolute top-0 left-0 w-full z-20">
                <Navbar />
            </div>
            <MovieHero movie={movie} />
            <div className="relative z-10 bg-black flex justify-start pl-[7rem]">
                <MovieCast cast={castData} />
            </div>


            {/* <MovieCast cast={movie.cast} /> */}
            <div className="py-12 md:py-16 pl-[7rem]">
              <MovieCommentSection />
            </div>
            <Footer/>
        </main>
    );
}