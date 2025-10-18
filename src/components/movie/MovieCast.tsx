'use client';

import Image from "next/image";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import type { Actor } from "@/types/actor";

interface MovieCastProps {
    cast: Actor[];
}

export default function MovieCast({ cast }: MovieCastProps) {
    return (
        <div className="w-full max-w-6xl mx-auto py-12 px-6 bg-card rounded-sm">
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full group"
            >
                <div className="flex justify-between items-center mb-4">

                    <h2 className="text-xl font-bold text-foreground">Cast</h2>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <CarouselPrevious className="static translate-y-0 bg-secondary border-border hover:bg-accent text-accent-foreground" />
                        <CarouselNext className="static translate-y-0 bg-secondary border-border hover:bg-accent text-accent-foreground" />
                    </div>
                </div>

                <CarouselContent className="-ml-3">
                    {cast.map((actor) => (
                        <CarouselItem key={actor.id} className="pl-3 basis-1/5 md:basis-1/8 lg:basis-1/10">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative w-full aspect-square rounded-full overflow-hidden mb-1">
                                    <Image
                                        src={actor.profileUrl}
                                        alt={actor.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 20vw, 10vw"
                                    />
                                </div>
                                <p className="font-semibold text-xs text-foreground truncate w-full">{actor.name}</p>
                                <p className="text-[11px] text-muted-foreground truncate w-full">{actor.character}</p>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}