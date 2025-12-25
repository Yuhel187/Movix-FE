import { Skeleton } from "@/components/ui/skeleton";

export function GenreSkeleton() {
    return (
        <section className="px-0 md:px-12 w-full">
            <Skeleton className="h-8 w-64 mb-6 bg-zinc-800" />
            <div className="flex gap-4 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-[130px] w-[240px] rounded-xl flex-shrink-0 bg-zinc-800" />
                ))}
            </div>
        </section>
    );
}
