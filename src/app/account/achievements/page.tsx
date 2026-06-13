"use client";

import React, { useEffect, useState } from "react";
import { Trophy, Lock, Star, Medal, Award, Crown, Zap, Flame, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProfile, getAchievements, type GamificationRank } from "@/services/gamification.service";
import type { Achievement } from "@/types/gamification";
import Image from "next/image";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type DisplayAchievement = Achievement & {
  current_progress?: number;
  progress?: number;
  unlocked_at?: string;
  is_unlocked?: boolean;
};

const rankGuide = [
  {
    key: "NEWBIE",
    name: "Mọt Phim",
    label: "Newbie",
    xpRange: "0 - 1,000 XP",
    icon: Star,
    color: "text-zinc-300",
    borderColor: "border-zinc-600/40",
    bgColor: "bg-zinc-800/50",
    perks: [
      "Sử dụng avatar mặc định.",
      "Chỉ được phép bình luận dưới dạng văn bản.",
    ],
  },
  {
    key: "MEMBER",
    name: "Cinephile",
    label: "Member",
    xpRange: "1,001 - 5,000 XP",
    icon: Medal,
    color: "text-sky-300",
    borderColor: "border-sky-400/40",
    bgColor: "bg-sky-500/10",
    perks: [
      "Được đổi màu tên hiển thị cơ bản.",
    ],
  },
  {
    key: "EXPERT",
    name: "Phê Phim",
    label: "Expert",
    xpRange: "5,001 - 20,000 XP",
    icon: Flame,
    color: "text-orange-300",
    borderColor: "border-orange-400/40",
    bgColor: "bg-orange-500/10",
    perks: [
      "Sử dụng avatar động GIF khi upload.",
      "Được viết Blog/Review chuyên sâu có ảnh hoặc video.",
      "Huy hiệu Expert hiển thị cạnh tên.",
    ],
  },
  {
    key: "LEGEND",
    name: "Huyền Thoại",
    label: "Legend",
    xpRange: "> 20,000 XP",
    icon: Crown,
    color: "text-yellow-300",
    borderColor: "border-yellow-400/50",
    bgColor: "bg-yellow-500/10",
    perks: [
      "Khung avatar phát sáng.",
      "Ghim bình luận để luôn hiển thị ở top đầu bài viết hoặc phim.",
      "Báo cáo được ưu tiên xử lý ngay lập tức.",
    ],
  },
];

export default function AchievementsPage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<DisplayAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [xp, setXp] = useState<number>(0);
  const [totalWatchTime, setTotalWatchTime] = useState<number>(0);
  const [currentRank, setCurrentRank] = useState<GamificationRank | null>(null);
  const [nextRank, setNextRank] = useState<GamificationRank | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [profileData, allAchievements] = await Promise.all([getProfile(), getAchievements()]);
        setXp(profileData.xp || 0);
        setTotalWatchTime(profileData.total_watch_time || 0);
        setCurrentRank(profileData.current_rank || null);
        setNextRank(profileData.next_rank || null);

        const unlockedIds = new Set((profileData.achievements || []).map((a) => a.id));
        const merged = (allAchievements || []).map((ach: DisplayAchievement) => ({
          ...ach,
          is_unlocked: Boolean(ach.is_unlocked || ach.unlocked_at || unlockedIds.has(ach.id)),
        }));

        setAchievements(merged);
      } catch (error) {
        console.error("Failed to load achievements", error);
        toast.error("Không thể tải thông tin thành tựu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // normalize achievements: some API responses use `unlocked_at` instead of `is_unlocked`
  const processedAchievements = achievements.map((a) => ({
    ...a,
    is_unlocked: Boolean(a.is_unlocked || a.unlocked_at),
  }));

  const unlockedAchievements = processedAchievements.filter((a) => a.is_unlocked);
  const lockedAchievements = processedAchievements.filter((a) => !a.is_unlocked);

  const unlockedCount = unlockedAchievements.length;
  const totalAchievements = achievements.length;

  const rankProgressPercent = React.useMemo(() => {
    if (!nextRank) return 100;
    if (!nextRank.min_xp || nextRank.min_xp <= 0) return 100;
    const p = Math.round((xp / nextRank.min_xp) * 100);
    return Math.max(0, Math.min(100, p));
  }, [xp, nextRank]);

  const rankProgressTarget = nextRank?.min_xp ?? null;
  const rankProgressLabel = rankProgressTarget
    ? `${xp.toLocaleString("vi-VN")} / ${rankProgressTarget.toLocaleString("vi-VN")} XP`
    : `${xp.toLocaleString("vi-VN")} XP`;
  const totalWatchTimeLabel = `${totalWatchTime.toLocaleString("vi-VN")} phút`;

  if (loading) {
     return (
       <div className="flex justify-center items-center py-20">
         <Loader2 className="animate-spin text-yellow-500 w-10 h-10" />
       </div>
     )
  }

  return (
    <div className="max-w-4xl dark">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Thành tựu</h1>
        <p className="text-gray-400">
          Theo dõi hành trình và thu thập các danh hiệu độc đáo của bạn.
        </p>
      </div>

      {/* Overview Card */}
      <Card className="bg-zinc-900 border-zinc-800 mb-10 overflow-hidden relative">
        <div className="absolute -top-6 -right-6 opacity-5 rotate-12 select-none pointer-events-none">
          <Trophy size={180} className="text-yellow-500" />
        </div>
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Tiến độ tổng quan</h2>
              <p className="text-sm text-gray-400">Bạn đã mở khóa {unlockedCount}/{totalAchievements} danh hiệu</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
                  {xp.toLocaleString("vi-VN")} XP
                </Badge>
                <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-300">
                  {totalWatchTimeLabel} xem
                </Badge>
              </div>
              <div className="mt-2 text-sm text-gray-300">
                <span className="font-medium">Hạng hiện tại:</span> {currentRank?.name || "—"}
                {nextRank && (
                  <span className="ml-3 text-gray-400">Tiến tới: {nextRank.name}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-500">{rankProgressPercent}%</div>
              <div className="text-xs font-medium text-gray-400">{rankProgressLabel}</div>
            </div>
          </div>
          <div className="relative h-6 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className={cn(
                "h-full transition-all duration-1000 ease-out",
                nextRank ? "bg-gradient-to-r from-yellow-600 to-yellow-400" : "bg-gradient-to-r from-yellow-400 to-yellow-200 shadow-lg ring-2 ring-yellow-400/20"
              )}
              style={{ width: `${rankProgressPercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center px-3 text-[11px] font-semibold text-white drop-shadow">
              {rankProgressLabel}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rank Guide */}
      <section className="mb-12">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <Zap className="text-yellow-500" />
              Quyền lợi theo hạng
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Mỗi mốc XP sẽ mở khóa thêm cách thể hiện cá nhân và quyền tương tác trong cộng đồng.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
            {xp.toLocaleString("vi-VN")} XP hiện tại
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rankGuide.map((rank) => {
            const RankIcon = rank.icon;
            const isCurrentRank = currentRank?.key === rank.key
              || currentRank?.name?.toLowerCase() === rank.name.toLowerCase()
              || currentRank?.name?.toLowerCase() === rank.label.toLowerCase();

            return (
              <div
                key={rank.label}
                className={cn(
                  "rounded-lg border bg-zinc-950/60 p-5 transition-colors",
                  rank.borderColor,
                  isCurrentRank && "ring-2 ring-yellow-400/30"
                )}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border", rank.borderColor, rank.bgColor)}>
                      <RankIcon className={cn("h-5 w-5", rank.color)} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-white">{rank.name}</h3>
                      <p className="text-sm text-gray-400">{rank.label}</p>
                    </div>
                  </div>
                  {isCurrentRank && (
                    <Badge className="shrink-0 bg-yellow-500 text-black hover:bg-yellow-500">
                      Hiện tại
                    </Badge>
                  )}
                </div>

                <div className="mb-4 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm">
                  <span className="text-gray-500">Điều kiện: </span>
                  <span className="font-semibold text-gray-200">{rank.xpRange}</span>
                </div>

                <ul className="space-y-2">
                  {rank.perks.map((perk) => (
                    <li key={perk} className="flex gap-2 text-sm leading-relaxed text-gray-300">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Unlocked Achievements - Display Case */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Award className="text-yellow-500" />
          Bộ Sưu Tập Danh Hiệu
        </h2>
        
        {unlockedAchievements.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement) => (
              <div 
                key={achievement.id}
                className="group relative bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-yellow-500/50 rounded-xl p-5 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    "relative w-12 h-12 rounded-lg shadow-lg shadow-black/50 overflow-hidden transform group-hover:scale-110 transition-transform duration-300 bg-zinc-800"
                  )}>
                     {achievement.icon_url ? (
                        <Image 
                          src={achievement.icon_url} 
                          alt={achievement.name} 
                          fill
                          className="object-cover"
                           onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/48";
                          }}
                        />
                      ) : (
                         <Trophy className="w-6 h-6 m-3 text-yellow-500" />
                      )}
                  </div>
                  <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/10">
                    Đã nhận
                  </Badge>
                </div>
                
                <h3 className="font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors">
                  {achievement.name}
                </h3>
                <p className="text-sm text-gray-400 mb-3 leading-relaxed min-h-[40px]">
                  {achievement.description}
                </p>
                
                <div className="text-xs text-zinc-500 font-medium pt-3 border-t border-zinc-800/50 flex items-center gap-1">
                  <Trophy size={12} />
                  Mở khóa ngày: {achievement.unlocked_at ? new Date(achievement.unlocked_at).toLocaleDateString("vi-VN") : "N/A"}
                </div>
              </div>
            ))}
          </div>
        ) : (
           <p className="text-gray-500 text-center py-8">Bạn chưa mở khóa danh hiệu nào. Hãy tích cực xem phim nhé!</p>
        )}
      </section>

      {/* Locked Achievements */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Lock className="text-gray-500" />
          Chưa Mở Khóa
        </h2>

        <div className="space-y-4">
          {lockedAchievements.map((achievement) => {
              let progressValue = achievement.current_progress ?? achievement.progress ?? 0;
              if (!progressValue) {
                if (achievement.condition_type === "XP") progressValue = xp;
                else if (achievement.condition_type === "TOTAL_WATCH_TIME") progressValue = totalWatchTime;
              }
            const percent = achievement.condition_value > 0 
                ? Math.min(100, Math.round((progressValue / achievement.condition_value) * 100))
                : 0;
            
            return (
              <div 
                key={achievement.id} 
                className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-zinc-950/50 border border-zinc-800 rounded-lg opacity-70 hover:opacity-100 transition-opacity"
              >
                {/* Icon (Grayed out) */}
                <div className="relative w-12 h-12 bg-zinc-900 rounded-full overflow-hidden grayscale opacity-50">
                    {achievement.icon_url ? (
                        <Image 
                          src={achievement.icon_url} 
                          alt={achievement.name} 
                          fill
                          className="object-cover"
                        />
                      ) : (
                         <Trophy className="w-6 h-6 m-3 text-zinc-600" />
                      )}
                </div>

                {/* Content */}
                <div className="flex-1 w-full text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-300">{achievement.name}</h3>
                    <span className="text-xs font-mono text-gray-500 bg-zinc-900 px-2 py-1 rounded">
                      {progressValue}/{achievement.condition_value}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-3">{achievement.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-zinc-600 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

