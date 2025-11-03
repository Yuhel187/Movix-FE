"use client";

import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 16,
  className,
  activeClassName = "text-red-500",
  inactiveClassName = "text-gray-600",
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          fill="currentColor"
          size={size}
          className={activeClassName}
        />
      ))}
      {hasHalfStar && (
        <StarHalf
          key="half"
          fill="currentColor"
          size={size}
          className={activeClassName}
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star
          key={`empty-${i}`}
          fill="currentColor"
          size={size}
          className={inactiveClassName}
        />
      ))}
    </div>
  );
}