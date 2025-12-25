import { Skeleton } from "@/components/ui/skeleton";

export function MovieCarouselSkeleton() {
    return (
        <div className="w-full py-6 px-4 md:px-12">
            <div className="flex justify-between items-center mb-5">
                <Skeleton className="h-8 w-48 bg-zinc-800" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-full bg-zinc-800" />
                    <Skeleton className="h-8 w-8 rounded-full bg-zinc-800" />
                </div>
            </div>
            <div className="flex gap-4 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2 flex-shrink-0">
                        <Skeleton className="h-[300px] w-[200px] rounded-lg bg-zinc-800" />
                        <Skeleton className="h-4 w-32 bg-zinc-800" />
                        <Skeleton className="h-3 w-20 bg-zinc-800" />
                    </div>
                ))}
            </div>
        </div>
    );
}
