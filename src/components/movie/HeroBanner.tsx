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
import { Play, Heart, Info, Loader2, ExternalLink } from "lucide-react";
import Image from "next/image";
import type { Banner } from "@/types/banner"; // Đổi import từ Movie sang Banner
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { checkFavoriteStatus, toggleFavorite } from "../../services/interaction.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function HeroBanner({ banners }: { banners: Banner[] }) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [carouselApi, setCarouselApi] = React.useState<any>(null);
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [isLoadingFav, setIsLoadingFav] = React.useState(false);

  const currentBanner = banners[selectedIndex];

  const isMovieContent = !!currentBanner?.movieId && !!currentBanner?.movie;

  React.useEffect(() => {
    if (isLoggedIn && isMovieContent && currentBanner.movie) {
      checkFavoriteStatus(currentBanner.movie.id.toString())
        .then((data) => setIsFavorite(data.isFavorite))
        .catch(() => { })
        .finally(() => setIsLoadingFav(false));
    } else {
      setIsFavorite(false);
      setIsLoadingFav(false);
    }
  }, [isLoggedIn, currentBanner, isMovieContent]);

  const handlePrimaryAction = () => {
    if (isMovieContent && currentBanner.movie?.slug) {
      router.push(`/movies/${currentBanner.movie.slug}/watch`);
    } else if (currentBanner.linkUrl) {
      if (currentBanner.linkUrl.startsWith('/')) {
        router.push(currentBanner.linkUrl);
      } else {
        window.open(currentBanner.linkUrl, '_blank');
      }
    }
  };

  const handleDetail = () => {
    if (isMovieContent && currentBanner.movie?.slug) {
      router.push(`/movies/${currentBanner.movie.slug}`);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isMovieContent || !currentBanner.movie) return;

    if (!isLoggedIn) {
      toast.error("Bạn cần đăng nhập để thực hiện việc này.");
      return;
    }

    const oldState = isFavorite;
    setIsFavorite(!oldState);

    try {
      const { message } = await toggleFavorite(currentBanner.movie.id.toString());
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
  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative w-full h-[100vh] overflow-hidden bg-black">
      <Carousel opts={{ loop: true }} setApi={setCarouselApi} className="w-full h-full relative">
        <CarouselContent>
          {banners.map((banner, index) => {
            const isMovieItem = !!banner.movieId && !!banner.movie;
            const displayImage = isMovieItem ? (banner.movie?.backdropUrl || banner.imageUrl) : banner.imageUrl;
            const displayTitle = isMovieItem ? banner.movie?.title : banner.title;
            const displayDesc = isMovieItem ? banner.movie?.description : banner.description;

            const isActive = index === selectedIndex;
            return (
              <CarouselItem key={banner.id}>
                <div className="relative w-full h-[100vh] text-white flex items-end pb-24 overflow-hidden">
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 overflow-hidden">
                      <Image
                        src={displayImage || "/placeholder.jpg"}
                        alt="Background Ambiance"
                        fill
                        priority={index === 0}
                        sizes="100vw"
                        className="object-cover object-center opacity-30 scale-110"
                      />
                    </div>

                    <div 
                      className={cn(
                        "absolute inset-0 z-10 transition-transform duration-[10000ms] ease-out will-change-transform",
                        isActive ? "scale-110" : "scale-100"
                      )}
                    >
                      <Image
                        src={displayImage || "/placeholder.jpg"}
                        alt={displayTitle || "Banner"}
                        fill
                        priority={index === 0}
                        sizes="100vw"
                        className="object-cover md:object-contain object-center"
                      />
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-20" />
                  </div>

                  <motion.div
                    key={banner.id + "-content"}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                    className="relative z-20 px-4 md:px-20 max-w-4xl pb-20 md:pb-16 w-full"
                  >
                    <h1 className="text-4xl md:text-6xl lg:text-8xl font-black mb-2 drop-shadow-xl md:line-clamp-none line-clamp-3 tracking-tight text-white">
                      {displayTitle}
                    </h1>

                    {isMovieItem && banner.movie && (
                      <>
                        {banner.movie.subTitle && (
                          <p className="text-lg md:text-3xl text-yellow-500 font-bold mb-2 tracking-wide drop-shadow-md">
                            {banner.movie.subTitle}
                          </p>
                        )}
                        <p className="text-base md:text-xl text-gray-300 font-semibold mb-6 tracking-wide drop-shadow-md">
                          {banner.movie.title}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {banner.movie.tags?.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="bg-white/10 border-white/30 text-white"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Description (Common) */}
                    {displayDesc && (
                      <p className="text-gray-200 max-w-2xl text-base md:text-lg mb-6 leading-relaxed line-clamp-3">
                        {displayDesc}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={handlePrimaryAction}
                        className={cn(
                          "relative overflow-hidden group rounded-full px-8 py-7 text-lg font-semibold transition-all duration-300",
                          isMovieItem
                            ? "bg-gradient-to-r from-red-600 to-red-800 hover:scale-105 hover:shadow-[0_0_20px_rgba(220,38,38,0.6)] border border-red-500/50"
                            : "bg-primary hover:bg-primary/80"
                        )}
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        {isMovieItem ? (
                          <span className="relative flex items-center gap-3">
                            <span className="bg-white text-red-600 rounded-full p-2 group-hover:rotate-180 transition-transform duration-500">
                              <Play className="w-6 h-6 fill-current" />
                            </span>
                            <span>Xem ngay</span>
                          </span>
                        ) : (
                          <span className="relative flex items-center gap-2">
                            <ExternalLink className="w-5 h-5" /> Khám phá
                          </span>
                        )}
                      </Button>

                      {isMovieItem && (
                        <>
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
                        </>
                      )}
                    </div>
                  </motion.div>
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>

        <CarouselPrevious className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full border-none backdrop-blur-sm z-30" />
        <CarouselNext className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full border-none backdrop-blur-sm z-30" />
      </Carousel>

      {/* Thumbnail Navigation */}
      <div className="absolute bottom-8 right-8 flex gap-3 z-20">
        {banners.map((banner, index) => {
          const isMovieItem = !!banner.movieId && !!banner.movie;
          const thumbImage = isMovieItem ? (banner.movie?.backdropUrl || banner.imageUrl) : banner.imageUrl;
          return (
            <button
              key={banner.id}
              onClick={() => {
                setSelectedIndex(index);
                carouselApi?.scrollTo(index);
              }}
              className={`relative w-24 h-14 rounded-md overflow-hidden transition-all duration-300 ${selectedIndex === index
                  ? "ring-2 ring-primary scale-105"
                  : "opacity-70 hover:opacity-100"
                }`}
            >
              <Image
                src={thumbImage || "/placeholder.jpg"}
                alt={banner.title}
                fill
                sizes="100px"
                className="object-cover"
              />
            </button>
          )
        })}
      </div>
    </div>
  );
}