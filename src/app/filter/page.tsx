import FilterPageClient from "@/components/filter/FilterPage";

export default async function FilterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const initialFilters = {
    q: resolvedParams.q || "",
    type: resolvedParams.type || "all",
    genre: resolvedParams.genre || "all",
    country: resolvedParams.country || "all",
    year: resolvedParams.year || "all",
  };

  return <FilterPageClient initialFilters={initialFilters} />;
}