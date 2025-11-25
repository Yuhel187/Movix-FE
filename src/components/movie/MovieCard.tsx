"use client"

import Image from "next/image"
import { useRef, useState, useEffect, MouseEvent } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, m } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Heart, Info, Play, Eye, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
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

    const subTitle = movie.subTitle || "";
    const displayDuration = duration || (type === 'TV' ? `${seasons?.length || 0} Mùa` : 'Phim lẻ');
    const displayPoster = movie.posterUrl || movie.poster_url || "https://static.vecteezy.com/system/resources/previews/020/276/914/non_2x/404-internet-error-page-icon-404-number-symbol-free-vector.jpg";
    const handleMouseEnter = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
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
            className="relative inline-block">
            <div
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
                    <Image
                        src={displayPoster}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        sizes="(max-width: 300px) 50vw, 20vw"
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
                            className="absolute left-1/2 top-0 z-50 w-[350px] h-[400px] -translate-x-1/2 -translate-y-[5%] rounded-xl overflow-hidden bg-card text-card-foreground shadow-2xl"
                        >
                            <div className="relative h-1/2 w-full">
                                <Image src={displayPoster} alt={title} fill className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                            </div>

                            <div className="h-1/2 p-5 flex flex-col justify-between">
                                <div className="space-y-2">
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

                                <p className="text-sm text-muted-foreground line-clamp-3">
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