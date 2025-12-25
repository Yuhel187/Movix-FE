/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Image from "next/image"
import { useRef, useState, useEffect, MouseEvent } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, m } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Heart, Info, Play, Eye, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import type { Movie } from "@/types/movie"
import { useAuth } from "@/contexts/AuthContext"
import { checkFavoriteStatus, toggleFavorite } from "@/services/interaction.service"
import { toast } from "sonner"

interface MovieCardProps {
    movie: Movie
    onWatch?: (movie: Movie) => void
    onLike?: (movie: Movie) => void
    onDetail?: (movie: Movie) => void
    className?: string
    disablePreview?: boolean
    subTitle?: string
    watchUrl?: string
}

export function MovieCard({
    movie,
    onWatch,
    onLike,
    onDetail,
    className,
    disablePreview,
}: MovieCardProps) {
    const router = useRouter()
    const [hovered, setHovered] = useState(false)
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const { isLoggedIn } = useAuth()
    const [isFavorite, setIsFavorite] = useState(false)
    const [isLoadingFav, setIsLoadingFav] = useState(true)
    const [isImageLoaded, setIsImageLoaded] = useState(false)
    const [isPreviewImageLoaded, setIsPreviewImageLoaded] = useState(false)
    const {
        id,
        title,
        posterUrl,
        description,
        tags,
        views,
        duration,
        releaseYear,
        type,
        rating,
        seasons,
        slug
    } = movie;

    const rawType = movie.type || (movie as any).media_type;

    const getTypeLabel = (t: string | undefined) => {
        if (!t) return "Phim lẻ";
        const upper = t.toUpperCase();
        if (upper === 'TV' || upper === 'SERIES') return "Phim bộ";
        return "Phim lẻ";
    };
    const displayType = getTypeLabel(rawType);

    const subTitle = movie.subTitle || "";
    const displayDuration = duration || (displayType === 'Phim bộ' ? `${seasons?.length || 0} Mùa` : 'Phim lẻ');
    const displayPoster = movie.posterUrl || movie.poster_url || "https://static.vecteezy.com/system/resources/previews/020/276/914/non_2x/404-internet-error-page-icon-404-number-symbol-free-vector.jpg";
    const cardRef = useRef<HTMLDivElement>(null)
    const [previewPosition, setPreviewPosition] = useState<"left" | "right" | "center">("center")

    const handleMouseEnter = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)

        // Calculate position before showing
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect()
            const screenWidth = window.innerWidth
            const previewWidth = 350 // w-[350px]

            // Allow some buffer (e.g. 20px)
            if (rect.left < (previewWidth / 2)) {
                setPreviewPosition("left")
            } else if (rect.right + (previewWidth / 2) > screenWidth) {
                setPreviewPosition("right")
            } else {
                setPreviewPosition("center")
            }
        }

        hoverTimeoutRef.current = setTimeout(() => setHovered(true), 300)
    }

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
        setHovered(false)
    }

    const handleDetail = () => {
        if (onDetail) {
            onDetail(movie)
        } else if (slug) {
            router.push(`/movies/${slug}`)
        }
    }

    const handleWatch = () => {
        if (onWatch) {
            onWatch(movie)
        } else if (slug) {
            router.push(`/movies/${slug}/watch`)
        }
    }
    useEffect(() => {
        if (isLoggedIn) {
            checkFavoriteStatus(movie.id.toString())
                .then((data) => setIsFavorite(data.isFavorite))
                .catch(() => { })
                .finally(() => setIsLoadingFav(false))
        } else {
            setIsFavorite(false)
            setIsLoadingFav(false)
        }
    }, [isLoggedIn, movie.id])

    const handleToggleFavorite = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        e.stopPropagation()

        if (!isLoggedIn) {
            toast.error("Bạn cần đăng nhập để thực hiện việc này.")
            return
        }

        const oldState = isFavorite
        setIsFavorite(!oldState)

        try {
            const { message } = await toggleFavorite(movie.id.toString())
            toast.success(message)
        } catch (error) {
            setIsFavorite(oldState)
            toast.error("Có lỗi xảy ra, vui lòng thử lại.")
        }
    }

    function formatViews(n?: number) {
        if (typeof n !== "number") return ""
        if (n >= 1_000_000_000)
            return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B"
        if (n >= 1_000_000)
            return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
        if (n >= 1_000)
            return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K"
        return String(n)
    }

    return (
        <div
            className="flex flex-col h-full w-full relative group"
        >
            <div
                ref={cardRef}
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div
                    className={cn(
                        "relative aspect-[2/3] overflow-hidden rounded-md bg-card shadow-sm transition-all hover:z-20 hover:shadow-lg cursor-pointer",
                        className
                    )}
                    onClick={handleDetail}
                >
                    {!isImageLoaded && (
                        <Skeleton className="absolute inset-0 h-full w-full bg-zinc-800" />
                    )}
                    <Image
                        src={displayPoster}
                        alt={title}
                        fill
                        className={cn(
                            "object-cover transition-all duration-500 hover:scale-105",
                            isImageLoaded ? "opacity-100" : "opacity-0"
                        )}
                        sizes="(max-width: 300px) 50vw, 20vw"
                        onLoad={() => setIsImageLoaded(true)}
                    />
                </div>
                <AnimatePresence>
                    {!disablePreview && hovered && (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                                "absolute top-0 z-50 w-[350px] h-[450px] -translate-y-[5%] rounded-xl overflow-hidden bg-card text-card-foreground shadow-2xl",
                                previewPosition === "center" && "left-1/2 -translate-x-1/2",
                                previewPosition === "left" && "left-0 translate-x-0",
                                previewPosition === "right" && "right-0 translate-x-0"
                            )}
                        >
                            <div className="relative h-[200px] w-full shrink-0">
                                {!isPreviewImageLoaded && (
                                    <Skeleton className="absolute inset-0 h-full w-full bg-zinc-800" />
                                )}
                                <Image 
                                    src={displayPoster} 
                                    alt={title} 
                                    fill 
                                    className={cn(
                                        "object-cover transition-opacity duration-300",
                                        isPreviewImageLoaded ? "opacity-100" : "opacity-0"
                                    )}
                                    onLoad={() => setIsPreviewImageLoaded(true)}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                            </div>

                            <div className="p-5 flex flex-col justify-between flex-1 min-h-0">
                                <div className="space-y-2 shrink-0">
                                    <div>
                                        <h3 className="text-xl font-semibold line-clamp-1">{title}</h3>
                                        {subTitle && (
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {subTitle}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                            onClick={handleWatch}
                                        >
                                            <Play className="size-4 mr-1" /> Xem
                                        </Button>
                                        <Button
                                            size="icon-sm"
                                            variant="ghost"
                                            onClick={handleToggleFavorite}
                                            disabled={isLoadingFav}
                                        >
                                            {isLoadingFav ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Heart
                                                    className={cn("h-4 w-4 transition-colors",
                                                        isFavorite ? "fill-red-500 text-red-500" : "text-white"
                                                    )}
                                                />
                                            )}
                                        </Button>

                                        <Button
                                            size="icon-sm"
                                            variant="ghost"
                                            onClick={handleDetail}
                                        >
                                            <Info className="size-4" />
                                        </Button>
                                    </div>

                                    {/* Metadata Tags (Layout bạn muốn giữ) */}
                                    <div className="flex flex-wrap gap-1 text-[12px] text-muted-foreground">

                                        <span className="bg-muted/20 px-2 py-0.5 rounded">{displayType}</span>

                                        {releaseYear && (
                                            <span className="bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded">
                                                {releaseYear}
                                            </span>
                                        )}

                                        {displayDuration && (
                                            <span className="bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded">
                                                {displayDuration}
                                            </span>
                                        )}

                                        {rating && rating > 0 ? (
                                            <span className="bg-yellow-500/20 border border-yellow-600/50 text-yellow-500 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                                IMDb {rating.toFixed(1)}
                                            </span>
                                        ) : null}
                                        {(tags || []).slice(0, 2).map((tag) => (
                                            <span
                                                key={tag}
                                                className="bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                                    {description}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="mt-2 px-0.5 cursor-pointer" onClick={handleDetail}>
                <p className="text-sm font-semibold text-foreground line-clamp-1">
                    {title}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-muted">
                    {displayDuration && (
                        <span className="inline-flex items-center gap-1 text-primary-foreground">
                            <Clock className="size-3" />
                            {displayDuration}
                        </span>
                    )}

                    {typeof views === "number" && (
                        <span className="inline-flex items-center gap-1 text-primary-foreground">
                            <Eye className="size-3" />
                            {formatViews(views)} lượt xem
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}