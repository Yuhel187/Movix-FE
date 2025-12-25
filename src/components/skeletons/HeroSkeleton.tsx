import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
    return (
        <div className="relative w-full h-[80vh] bg-zinc-900 overflow-hidden">
            <Skeleton className="w-full h-full bg-zinc-800" />
            <div className="absolute bottom-0 left-0 p-8 w-full md:w-1/2 space-y-4">
                <Skeleton className="h-12 w-3/4 bg-zinc-700" />
                <Skeleton className="h-4 w-full bg-zinc-700" />
                <Skeleton className="h-4 w-2/3 bg-zinc-700" />
                <div className="flex gap-4 pt-4">
                    <Skeleton className="h-12 w-32 rounded-full bg-zinc-700" />
                    <Skeleton className="h-12 w-12 rounded-full bg-zinc-700" />
                </div>
            </div>
        </div>
    );
}
