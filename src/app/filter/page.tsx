import FilterPage from "@/components/filter/FilterPage";

export default function Page({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    type?: string;
    genre?: string;
    country?: string;
    year?: string;
  };
}) {
  return <FilterPage searchParams={searchParams} />;
}