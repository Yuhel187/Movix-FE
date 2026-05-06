"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, ExternalLink, BellRing } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { Skeleton } from "@/components/ui/skeleton";

interface HistoryItem {
    id: string;
    title: string;
    message: string;
    channel: "IN_APP" | "EMAIL" | "PUSH";
    isSent: boolean;
    scheduledAt?: string;
    actionUrl?: string;
    createdAt: string;
}

export function NotificationHistory({ refreshTrigger }: { refreshTrigger: number }) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const res = await apiClient.get('/notifications/history');
                setHistory(res.data.data);
            } catch (error) {
                console.error("Lỗi tải lịch sử thông báo");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [refreshTrigger]);

    if (loading) {
        return <Skeleton className="w-full h-40 bg-slate-800" />;
    }

    return (
        <Card className="bg-[#1F1F1F] border-slate-800 text-white h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400"/> Lịch sử Broadcast
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
                <div className="h-full overflow-y-auto">
                    <Table>
                        <TableHeader className="bg-black/20 sticky top-0 z-10">
                            <TableRow className="border-slate-700 hover:bg-transparent">
                                <TableHead className="text-slate-300">Nội dung</TableHead>
                                <TableHead className="text-slate-300 w-[100px]">Kênh/Trạng thái</TableHead>
                                <TableHead className="text-slate-300 w-[100px]">Thời gian</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow className="border-none">
                                    <TableCell colSpan={3} className="text-center text-slate-500 py-8">
                                        Chưa có thông báo nào được gửi.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map((item) => (
                                    <TableRow key={item.id} className="border-slate-800 hover:bg-white/5">
                                        <TableCell>
                                            <div className="font-medium text-white flex items-center gap-2">
                                                <BellRing className="w-3 h-3 text-green-500" />
                                                {item.title}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1 line-clamp-2">{item.message}</div>
                                            {item.actionUrl && (
                                                <div className="flex items-center gap-1 mt-1 text-[10px] text-blue-400">
                                                    <ExternalLink className="w-3 h-3" /> {item.actionUrl}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className={cn(
                                                    "text-[10px] px-1.5 py-0.5 rounded-full w-fit font-bold",
                                                    item.channel === "EMAIL" ? "bg-blue-500/20 text-blue-400" :
                                                    item.channel === "PUSH" ? "bg-purple-500/20 text-purple-400" :
                                                    "bg-orange-500/20 text-orange-400"
                                                )}>
                                                    {item.channel}
                                                </span>
                                                <span className={cn(
                                                    "text-[9px] italic",
                                                    item.isSent ? "text-green-500" : "text-yellow-500"
                                                )}>
                                                    {item.isSent ? "Đã gửi" : "Chờ gửi"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[10px] text-slate-500 whitespace-nowrap">
                                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi })}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}