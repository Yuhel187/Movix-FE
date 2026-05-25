"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

import {
  getOnboardingData,
  submitOnboarding,
  OnboardingData,
  OnboardingPayload,
} from "@/services/onboarding.service";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/apiClient";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData | null>(null);
  
  const [step, setStep] = useState(1);
  
  // Selections
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [selectedCharacterTypes, setSelectedCharacterTypes] = useState<string[]>([]);
  const [selectedContentToAvoid, setSelectedContentToAvoid] = useState<string[]>([]);
  const [explorationLevel, setExplorationLevel] = useState<number>(50);

  useEffect(() => {
    // If user already onboarded, send them to home
    if (user?.preferences?.onboarded_at) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getOnboardingData();
        setData(result);
      } catch (error) {
        toast.error("Không thể tải dữ liệu khởi tạo. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const toggleSelection = (
    item: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload: OnboardingPayload = {
        fav_genres: selectedGenres,
        seed_movie_ids: selectedMovies,
        vibes: selectedVibes,
        favorite_character_types: selectedCharacterTypes,
        content_to_avoid: selectedContentToAvoid,
        exploration_level: explorationLevel,
      };
      
      const response = await submitOnboarding(payload);
      toast.success(response.message || "Đã lưu sở thích của bạn!");
      
      // Update local user context to reflect onboarded status
      if (user) {
        setUser({
          ...user,
          preferences: {
            ...user.preferences,
            onboarded_at: response.data?.onboarded_at || new Date().toISOString(),
          }
        });
      }
      
      // Force a full checkAuth behind the scenes
      apiClient.get("/profile/me").then((res) => {
         // handle updated user if needed
      }).catch(console.error);

      router.push("/");
    } catch (error) {
      toast.error((error as any).response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-gray-400 animate-pulse">Đang chuẩn bị trải nghiệm cho bạn...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="pt-8 pb-4 px-6 md:px-12 flex justify-between items-center relative z-10">
        <Image src="/images/logo.png" alt="Movix" width={100} height={30} className="object-contain" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/50" : "w-4 bg-muted"
              }`}
            />
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 h-full">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-8">
                <h1 className="text-3xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700">
                  Thể loại yêu thích của bạn là gì?
                </h1>
                <p className="text-gray-400 text-lg">Chọn các thể loại để Movix gợi ý phim chuẩn gu nhé.</p>
              </div>

              <div className="flex flex-wrap gap-3 overflow-y-auto pb-8 no-scrollbar">
                {data.genres.map((genre) => {
                  const isSelected = selectedGenres.includes(genre.id);
                  return (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={genre.id}
                      onClick={() => toggleSelection(genre.id, selectedGenres, setSelectedGenres)}
                      className={`px-5 py-3 rounded-full text-sm font-medium transition-all duration-300 border flex items-center gap-2 ${
                        isSelected
                          ? "bg-red-600 text-white border-red-600 shadow-[0_4px_15px_rgba(220,38,38,0.3)]"
                          : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {genre.name}
                      {isSelected && <Check className="w-4 h-4" />}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-8">
                <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Bạn đã từng xem và thích phim nào?</h1>
                <p className="text-gray-400 text-lg">Điều này giúp chúng tôi hiểu rõ hơn về gu phim của bạn.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 overflow-y-auto pb-8 no-scrollbar">
                {data.seed_movies.map((movie) => {
                  const isSelected = selectedMovies.includes(movie.id);
                  return (
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      key={movie.id}
                      onClick={() => toggleSelection(movie.id, selectedMovies, setSelectedMovies)}
                      className="relative cursor-pointer group rounded-xl overflow-hidden aspect-[2/3] shadow-lg"
                    >
                      <Image
                        src={movie.poster_url || "/images/placeholder-poster.png"}
                        alt={movie.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className={`absolute inset-0 transition-colors duration-300 ${isSelected ? "bg-primary/40" : "bg-black/20 group-hover:bg-transparent"}`} />
                      
                      {/* Selection Overlay */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                          >
                            <div className="bg-primary rounded-full p-3 shadow-[0_0_30px_rgba(229,9,20,0.8)]">
                              <Check className="w-8 h-8 text-white" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
                        <p className="text-sm font-medium text-white line-clamp-2">{movie.title}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-8">
                <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Cảm xúc & Nhân vật</h1>
                <p className="text-gray-400 text-lg">Bạn thường bị thu hút bởi Vibe nào và kiểu nhân vật ra sao?</p>
              </div>

              <div className="space-y-10 overflow-y-auto pb-8 no-scrollbar pr-4">
                {/* Vibes */}
                <section>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-primary">✨</span> Vibe phim mong muốn
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {data.predefined_vibes.map((vibe) => {
                      const isSelected = selectedVibes.includes(vibe);
                      return (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          key={vibe}
                          onClick={() => toggleSelection(vibe, selectedVibes, setSelectedVibes)}
                          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                            isSelected
                              ? "bg-red-600 text-white border-red-600 shadow-[0_4px_15px_rgba(220,38,38,0.3)]"
                              : "bg-white/10 text-gray-300 border-transparent hover:bg-white/20 hover:text-white"
                          }`}
                        >
                          {vibe}
                        </motion.button>
                      );
                    })}
                  </div>
                </section>

                {/* Character Types */}
                <section>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-yellow-500">🎭</span> Kiểu nhân vật yêu thích
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {data.predefined_character_types.map((char) => {
                      const isSelected = selectedCharacterTypes.includes(char);
                      return (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          key={char}
                          onClick={() => toggleSelection(char, selectedCharacterTypes, setSelectedCharacterTypes)}
                          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                            isSelected
                              ? "bg-red-600 text-white border-red-600 shadow-[0_4px_15px_rgba(220,38,38,0.3)]"
                              : "bg-white/10 text-gray-300 border-transparent hover:bg-white/20 hover:text-white"
                          }`}
                        >
                          {char}
                        </motion.button>
                      );
                    })}
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-8">
                <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Chi tiết cuối cùng</h1>
                <p className="text-gray-400 text-lg">Giúp Movix mang đến trải nghiệm hoàn hảo nhất cho bạn.</p>
              </div>

              <div className="space-y-12 overflow-y-auto pb-8 no-scrollbar pr-4">
                {/* Content to Avoid */}
                <section>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-destructive">
                    🚫 Nội dung muốn né tránh (Tùy chọn)
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {data.predefined_content_to_avoid.map((item) => {
                      const isSelected = selectedContentToAvoid.includes(item);
                      return (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          key={item}
                          onClick={() => toggleSelection(item, selectedContentToAvoid, setSelectedContentToAvoid)}
                          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                            isSelected
                              ? "bg-red-900/40 text-red-400 border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)]"
                              : "bg-white/10 text-gray-300 border-transparent hover:bg-white/20 hover:border-red-500/30"
                          }`}
                        >
                          {item}
                        </motion.button>
                      );
                    })}
                  </div>
                </section>

                {/* Exploration Level */}
                <section className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-2">Mức độ khám phá</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Bạn muốn xem những phim an toàn theo gu hiện tại, hay sẵn sàng khám phá các thể loại mới lạ?
                  </p>
                  
                  <div className="px-2">
                    <Slider
                      value={[explorationLevel]}
                      onValueChange={(val) => setExplorationLevel(val[0])}
                      max={100}
                      step={1}
                      className="my-6"
                    />
                    <div className="flex justify-between text-sm font-medium mt-2">
                      <span className="text-gray-400">Chỉ xem theo gu</span>
                      <span className="text-red-500 font-bold">{explorationLevel}%</span>
                      <span className="text-yellow-500">Khám phá cái mới</span>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons - Sides */}
        <AnimatePresence>
          {step > 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-50"
            >
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                disabled={submitting}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/50 border-white/20 text-white hover:bg-white/10 hover:scale-110 transition-all backdrop-blur-md"
              >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 items-center"
          >
            {step < 4 ? (
              <Button
                size="icon"
                onClick={handleNext}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all hover:scale-110 border-none"
              >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white px-6 md:px-8 h-12 md:h-14 shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all hover:scale-105 font-bold border-none"
              >
                {submitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Xong <Play className="w-5 h-5 ml-2 fill-current" />
                  </>
                )}
              </Button>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
