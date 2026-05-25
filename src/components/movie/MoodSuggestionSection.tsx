"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getMoodDetect, getMoodSuggest, MoodData } from "@/services/mood.service";
import { MovieCarousel } from "./MovieCarousel";

const MOOD_TYPES = [
  { id: "MORNING_CASUAL", label: "Buổi sáng", emoji: "🌅" },
  { id: "AFTERNOON_FOCUS", label: "Trưa tập trung", emoji: "☕" },
  { id: "EVENING_RELAX", label: "Thư giãn tối", emoji: "🌙" },
  { id: "LATE_NIGHT_THRILLER", label: "Đêm khuya", emoji: "🦉" },
  { id: "WEEKEND_BINGE", label: "Cuối tuần", emoji: "🍿" },
  { id: "QUICK_WATCH", label: "Xem nhanh", emoji: "⚡" },
];

export function MoodSuggestionSection() {
  const [data, setData] = useState<MoodData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingTab, setLoadingTab] = useState<string | null>(null);

  useEffect(() => {
    const fetchAutoDetect = async () => {
      try {
        const response = await getMoodDetect();
        if (response.success && response.data) {
          console.log("🌟 [Auto-Detect] Mood Data (Phản hồi của AI):", response.data);
          console.log("🎬 [Auto-Detect] Movies:", response.data.movies);
          setData(response.data);
        }
      } catch (error) {
        console.error("Failed to detect mood:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAutoDetect();
  }, []);

  const handleManualOverride = async (moodId: string) => {
    if (data?.mood === moodId) return; // Already selected
    
    setLoadingTab(moodId);
    try {
      const response = await getMoodSuggest(moodId);
      if (response.success && response.data) {
        console.log(`🌟 [Manual-Override: ${moodId}] Mood Data (Phản hồi của AI):`, response.data);
        console.log(`🎬 [Manual-Override: ${moodId}] Movies:`, response.data.movies);
        setData(response.data);
      }
    } catch (error) {
      console.error("Failed to suggest mood:", error);
    } finally {
      setLoadingTab(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return null; // Don't render if completely no data
  }

  return (
    <section className="w-full pt-8 pb-4">
      {/* Tabs / Pills for manual override */}
      <div className="px-4 sm:px-8 lg:px-12 mb-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {MOOD_TYPES.map((type) => {
            const isSelected = data.mood === type.id;
            const isTabLoading = loadingTab === type.id;
            
            return (
              <button
                key={type.id}
                onClick={() => handleManualOverride(type.id)}
                disabled={loadingTab !== null}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 border ${
                  isSelected
                    ? "bg-red-600 text-white border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                    : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white"
                } ${(loadingTab !== null && !isTabLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isTabLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{type.emoji}</span>
                )}
                {type.label}
              </button>
            );
          })}
        </div>
        <p className="text-gray-400 text-sm md:text-base italic pl-1">
          {data.description}
        </p>
      </div>

      {/* Movies Display */}
      {data.movies && data.movies.length > 0 ? (
        <MovieCarousel
          title={`${data.emoji} ${data.label}`}
          movies={data.movies}
        />
      ) : (
        <div className="px-4 sm:px-8 lg:px-12 py-10 flex flex-col items-center justify-center text-center">
          <p className="text-gray-400 mb-2">Hiện tại chưa có phim nào phù hợp với tâm trạng <strong className="text-white">{data.label}</strong>.</p>
          <p className="text-gray-500 text-sm">Bạn thử chọn một tâm trạng khác xem sao nhé!</p>
        </div>
      )}
    </section>
  );
}
