"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation"; // Thêm usePathname
import { Pagination } from "@/components/common/pagination";

interface ServerPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function ServerPagination({ 
  currentPage, 
  totalPages, 
}: ServerPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname(); 

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
}