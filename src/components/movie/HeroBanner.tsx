'use client';
import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Heart, Info, Loader2 } from "lucide-react";
import Image from "next/image";
import type { Movie } from "@/types/movie";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { checkFavoriteStatus, toggleFavorite } from "../../services/interaction.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function HeroBanner({ movies }: { movies: Movie[] }) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [carouselApi, setCarouselApi] = React.useState<any>(null);
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [isLoadingFav, setIsLoadingFav] = React.useState(false);


  const currentMovie = movies[selectedIndex];

  React.useEffect(() => {
    if (isLoggedIn && currentMovie) {
      checkFavoriteStatus(currentMovie.id.toString())
        .then((data) => setIsFavorite(data.isFavorite))
        .catch(() => {})
        .finally(() => setIsLoadingFav(false));
    } else {
      setIsFavorite(false);
      setIsLoadingFav(false);
    }
  }, [isLoggedIn, currentMovie?.id]); 

  const handleWatch = () => {
    if (currentMovie?.slug) {
      router.push(`/movies/${currentMovie.slug}/watch`);
    }
  };

  const handleDetail = () => {
    if (currentMovie?.slug) {
      router.push(`/movies/${currentMovie.slug}`);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      toast.error("Bạn cần đăng nhập để thực hiện việc này.");
      return;
    }
    if (!currentMovie) return;

    const oldState = isFavorite;
    setIsFavorite(!oldState); 

    try {
      const { message } = await toggleFavorite(currentMovie.id.toString());
      toast.success(message);
    } catch (error) {
      setIsFavorite(oldState); 
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  React.useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setSelectedIndex(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => carouselApi.off("select", onSelect);
  }, [carouselApi]);

  return (
    <div className="relative w-full h-[100vh] overflow-hidden bg-black">
      <Carousel opts={{ loop: true }} setApi={setCarouselApi} className="w-full h-full relative">
        <CarouselContent>
          {movies.map((movie, index) => (
            <CarouselItem key={movie.id}>
              <AnimatePresence mode="wait">
                {selectedIndex === index && (
                  <motion.section
                    key={movie.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="relative w-full h-[100vh] text-white flex items-end pb-24"
                  >
                    {/*cinematic fade */}
                    <motion.div
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.03 }}
                      transition={{ duration: 0.9, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={movie.backdropUrl || "/placeholder.jpg"}
                        alt={movie.title}
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover object-center brightness-75"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                    </motion.div>
                    <motion.div
                      key={movie.title}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -40 }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                      className="relative z-20 px-10 md:px-20 max-w-4xl pb-16"
                    >
                      <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-md">
                        {movie.title}
                      </h1>
                      {movie.subTitle && (
                        <p className="text-xl md:text-2xl text-gray-300 mb-2 italic">
                          {movie.subTitle}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {movie.tags?.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="bg-white/10 border-white/30 text-white"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <p className="text-gray-200 max-w-2xl text-base md:text-lg mb-6 leading-relaxed">
                        {movie.description}
                      </p>

                      <div className="flex items-center gap-4">
                        <Button
                          onClick={handleWatch}
                          className="bg-primary hover:bg-primary/80 text-white rounded-full px-6 py-6 text-lg flex items-center gap-2"
                        >
                          <Play className="w-5 h-5" /> Xem ngay
                        </Button>

                        <Button
                          variant="outline"
                          onClick={handleToggleFavorite}
                          disabled={isLoadingFav}
                          className="rounded-full border-white/30 bg-white/10 hover:bg-white/20 text-white w-12 h-12 p-0 flex items-center justify-center"
                        >
                           {isLoadingFav ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Heart className={cn("w-5 h-5", isFavorite ? "fill-red-500 text-red-500" : "text-white")} />
                            )}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={handleDetail}
                          className="rounded-full border-white/30 bg-white/10 hover:bg-white/20 text-white w-12 h-12 p-0 flex items-center justify-center"
                        >
                          <Info className="w-5 h-5" />
                        </Button>
                      </div>
                    </motion.div>
                  </motion.section>
                )}
              </AnimatePresence>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full border-none backdrop-blur-sm z-30" />
        <CarouselNext className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full border-none backdrop-blur-sm z-30" />
      </Carousel>

      {/* Thumbnail */}
      <div className="absolute bottom-8 right-8 flex gap-3 z-20">
        {movies.map((movie, index) => (
          <button
            key={movie.id}
            onClick={() => {
              setSelectedIndex(index);
              carouselApi?.scrollTo(index);
            }}
            className={`relative w-24 h-14 rounded-md overflow-hidden transition-all duration-300 ${
              selectedIndex === index
                ? "ring-2 ring-primary scale-105"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <Image
              src={movie.backdropUrl || "/placeholder.jpg"}
              alt={movie.title}
              fill
              sizes="100px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
