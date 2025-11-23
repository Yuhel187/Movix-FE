/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  PieChart, Pie, Cell, Sector, ResponsiveContainer, Legend as RechartsLegend, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from "recharts";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
} from "@/components/ui/card";
import {
  Table, TableBody, TableRow, TableCell, TableHead, TableHeader,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChartConfig, ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";
import { Users, Film, Eye, MessageSquare } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// --- Types ---
interface KpiData {
  users: number;
  movies: number;
  views: number;
  comments_today: number;
}

interface GenreData {
  genre: string;
  count: number;
  fill: string;
}

interface TopMovieData {
  movie: string;
  favorites: number;
  fill: string;
}

interface RecentUser {
  id: string;
  display_name: string;
  username: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

const baseChartConfig = {
  count: { label: "Số lượng" },
  favorites: { label: "Lượt thích", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const ActiveSectorMark = ({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent }: any) => {
  return (
    <g>
      <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#FFF" className="text-lg font-bold">
        {payload.genre}
      </text>
      <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#9CA3AF" className="text-sm">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
      <Sector
        cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
        startAngle={startAngle} endAngle={endAngle} fill={fill}
        className="drop-shadow-lg stroke-2 stroke-black"
      />
    </g>
  );
};

export default function DashboardPage() {
  const [activeDonutIndex, setActiveDonutIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [kpiData, setKpiData] = useState<KpiData>({ users: 0, movies: 0, views: 0, comments_today: 0 });
  const [genreData, setGenreData] = useState<GenreData[]>([]);
  const [topMovies, setTopMovies] = useState<TopMovieData[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [hoveredMovie, setHoveredMovie] = useState<string | null>(null);

  const dynamicChartConfig = useMemo(() => {
    const config: ChartConfig = { ...baseChartConfig };
    genreData.forEach((item) => {
      config[item.genre] = {
        label: item.genre,
        color: item.fill,
      };
    });
    return config;
  }, [genreData]);

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveDonutIndex(index);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, genreRes, topMoviesRes, usersRes] = await Promise.all([
          apiClient.get('/dashboard/stats'),
          apiClient.get('/dashboard/genres'),
          apiClient.get('/dashboard/top-movies'),
          apiClient.get('/dashboard/recent-users'),
        ]);

        setKpiData(statsRes.data);
        setGenreData(genreRes.data);
        setTopMovies(topMoviesRes.data);
        setRecentUsers(usersRes.data);
      } catch (error) {
        console.error("Lỗi tải dashboard:", error);
        toast.error("Không thể tải dữ liệu thống kê.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full text-white space-y-6 animate-fade-in pb-10">
      
      {/* --- HÀNG 1: KPI CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Tổng User" 
          value={kpiData.users} 
          subtext="Tài khoản hoạt động" 
          icon={Users} 
          color="text-[var(--chart-3)]" 
          loading={loading} 
        />
        <KpiCard 
          title="Tổng Phim" 
          value={kpiData.movies} 
          subtext="Phim trong kho" 
          icon={Film} 
          color="text-[var(--chart-1)]" 
          loading={loading} 
        />
        <KpiCard 
          title="Tổng Lượt xem" 
          value={kpiData.views} 
          subtext="Dựa trên lịch sử xem" 
          icon={Eye} 
          color="text-[var(--chart-4)]" 
          loading={loading} 
        />
        <KpiCard 
          title="Bình luận mới" 
          value={kpiData.comments_today} 
          subtext="Trong hôm nay" 
          icon={MessageSquare} 
          color="text-[var(--chart-2)]" 
          loading={loading} 
        />
      </div>

      {/* --- HÀNG 2: BIỂU ĐỒ (Bar + Pie) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#262626] border-slate-800 text-white h-full">
          <CardHeader>
            <CardTitle>Top Phim Được Yêu Thích Nhất</CardTitle>
            <CardDescription>Dựa trên số lượt thêm vào danh sách yêu thích</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[350px] w-full bg-slate-700" />
            ) : topMovies.length > 0 ? (
              <ChartContainer config={baseChartConfig} className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={topMovies} 
                    layout="vertical" 
                    margin={{ left: 0, right: 30 }}
                    onMouseLeave={() => setHoveredMovie(null)}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} horizontal={false} />
                    <XAxis type="number" stroke="#888" fontSize={12} hide />
                    <YAxis 
                      dataKey="movie" type="category" stroke="#fff" fontSize={13} width={140} tickLine={false} axisLine={false} 
                    />
                    
                    <RechartsTooltip
                      cursor={false} 
                      content={<ChartTooltipContent indicator="line" />}
                    />

                    <Bar dataKey="favorites" radius={[0, 4, 4, 0]} barSize={32}>
                      {topMovies.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.fill}
                          onMouseEnter={() => setHoveredMovie(entry.movie)}
                          fillOpacity={hoveredMovie && hoveredMovie !== entry.movie ? 0.3 : 1}
                          
                          className="transition-all duration-300 ease-in-out cursor-pointer"
                          style={{
                            filter: hoveredMovie === entry.movie ? 'brightness(1.2)' : 'none'
                          }}
                        />
                      ))}
                      <LabelList 
                        dataKey="favorites" position="right" offset={10} className="fill-white font-bold" fontSize={12} 
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-gray-500">Chưa có dữ liệu</div>
            )}
          </CardContent>
        </Card>

        {/* Cột phải (1/3): Pie Chart (Genre) */}
        <Card className="lg:col-span-1 bg-[#262626] border-slate-800 text-white h-full flex flex-col">
          <CardHeader>
            <CardTitle>Phân bố Thể loại</CardTitle>
            <CardDescription>Top 5 thể loại phổ biến</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center min-h-[350px]">
            {loading ? (
               <Skeleton className="h-64 w-64 rounded-full bg-slate-700" />
            ) : genreData.length > 0 ? (
              <ChartContainer config={dynamicChartConfig} className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <RechartsTooltip content={<ChartTooltipContent hideLabel/>} />
                    <Pie
                      data={genreData}
                      dataKey="count"
                      nameKey="genre"
                      cx="50%" cy="45%" 
                      innerRadius={65} outerRadius={95}
                      activeIndex={activeDonutIndex}
                      activeShape={ActiveSectorMark}
                      onMouseEnter={onPieEnter}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {genreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>

                    <RechartsLegend 
                      content={<ChartLegendContent nameKey="genre" />}
                      className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="text-gray-500">Chưa có dữ liệu</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- HÀNG 3: DANH SÁCH USER (Full Width) --- */}
      <Card className="bg-[#262626] border-slate-800 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Người dùng mới đăng ký</CardTitle>
          </div>
          <CardDescription>Danh sách 5 thành viên mới nhất gia nhập hệ thống</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
                <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-gray-300 pl-6">Người dùng</TableHead>
                    <TableHead className="text-gray-300">Email</TableHead>
                    <TableHead className="text-gray-300 text-right pr-6">Ngày tham gia</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="border-slate-800">
                       <TableCell className="pl-6"><Skeleton className="h-10 w-10 rounded-full bg-slate-700 inline-block mr-3" /><Skeleton className="h-4 w-24 bg-slate-700 inline-block" /></TableCell>
                       <TableCell><Skeleton className="h-4 w-48 bg-slate-700" /></TableCell>
                       <TableCell className="pr-6 text-right"><Skeleton className="h-4 w-20 bg-slate-700 ml-auto" /></TableCell>
                    </TableRow>
                 ))
              ) : recentUsers.map((user) => (
                <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-600">
                        <AvatarImage src={user.avatar_url || ""} alt={user.display_name} />
                        <AvatarFallback className="bg-slate-700">{user.username[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{user.display_name || user.username}</span>
                        <span className="text-xs text-gray-400">@{user.username}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{user.email}</TableCell>
                  <TableCell className="text-right pr-6 text-gray-400">
                    {user.created_at ? format(new Date(user.created_at), "dd/MM/yyyy", { locale: vi }) : "N/A"}
                  </TableCell>
                </TableRow>
              ))} 
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
function KpiCard({ title, value, subtext, icon: Icon, color, loading }: any) {
    return (
        <Card className="bg-[#262626] border-slate-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24 bg-slate-700 mb-1"/> : 
              <div className="text-2xl font-bold">{value.toLocaleString("vi-VN")}</div>
            }
            <p className="text-xs text-gray-400 mt-1">{subtext}</p>
          </CardContent>
        </Card>
    )
}