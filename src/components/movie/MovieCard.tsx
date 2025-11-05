"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Heart, Info, Play, Eye, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Movie } from "@/types/movie"

interface MovieCardProps {
    movie: Movie
    onWatch?: (movie: Movie) => void
    onLike?: (movie: Movie) => void
    onDetail?: (movie: Movie) => void
    className?: string
    disablePreview?: boolean
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
    const {
        title,
        subTitle,
        posterUrl,
        year,
        type,
        episode,
        tags = [],
        description,
        duration,
        views,
        slug,
    } = movie

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
                        src={posterUrl}
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
                                <Image src={posterUrl} alt={title} fill className="object-cover" />
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
                                            onClick={() => onLike?.(movie)}
                                        >
                                            <Heart className="size-4" />
                                        </Button>

                                        <Button
                                            size="icon-sm"
                                            variant="ghost"
                                            onClick={handleDetail}
                                        >
                                            <Info className="size-4" />
                                        </Button>
                                    </div>

                                    <div className="flex flex-wrap gap-1 text-[12px] text-muted-foreground">
                                        {type && (
                                            <span className="bg-muted/20 px-2 py-0.5 rounded">{type}</span>
                                        )}
                                        {year && (
                                            <span className="bg-muted/20 px-2 py-0.5 rounded">{year}</span>
                                        )}
                                        {episode && (
                                            <span className="bg-muted/20 px-2 py-0.5 rounded">
                                                {episode}
                                            </span>
                                        )}
                                        {tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="bg-muted/20 px-2 py-0.5 rounded"
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
                    {duration && (
                        <span className="inline-flex items-center gap-1 text-primary-foreground">
                            <Clock className="size-3" />
                            {duration}
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