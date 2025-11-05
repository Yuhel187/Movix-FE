"use client"; // Ensure this file is treated as a Client Component

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import apiClient from "@/lib/apiClient"; 
import { toast } from "sonner";

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token'); 

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Token không hợp lệ hoặc bị thiếu. Vui lòng thử lại từ email.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu và xác nhận mật khẩu không khớp!');
            return;
        }

        if (newPassword.length < 6) {
             setError('Mật khẩu phải có ít nhất 6 ký tự.');
             return;
        }

        setIsLoading(true);

        try {
            await apiClient.post('/auth/reset-password', {
                token,
                newPassword
            });

            toast.success("Đặt lại mật khẩu thành công!");
            router.push('/login'); 

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Đã xảy ra lỗi. Vui lòng thử lại.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center p-4">
            <div className="absolute inset-0">
                <Image
                    src="https://image.tmdb.org/t/p/original/vVpEOvdxVBP2aV166j5Xlvb5Cdc.jpg"
                    alt="Background"
                    layout="fill"
                    sizes="100vw"
                    objectFit="cover" 
                    className="opacity-30"
                />
            </div>

            <div className="absolute inset-0 bg-black/70 -z-10" />

            {/* Box */}
            <div className="w-full max-w-4xl overflow-hidden rounded-xl bg-black/80 text-white shadow-[0_0_40px_rgba(255,0,0,0.4)] backdrop-blur-xl">
                <div className="grid grid-cols-1 md:grid-cols-[0.7fr_1.3fr]">
                    {/* Left poster */}
                    <div className="hidden md:block relative h-full">
                        <Image
                            src="https://image.tmdb.org/t/p/original/AvNFQWhRh3b9fHNGWh4nn45JVjz.jpg"
                            alt="Poster"
                            layout="fill"
                            sizes="40vw"
                            objectFit="cover"
                            className="absolute inset-0 object-cover brightness-75"
                        />
                    </div>

                    {/* Form section */}
                    <div className="p-10 flex flex-col justify-center">
                        <h2 className="text-3xl font-bold mb-2">Đặt lại mật khẩu</h2>
                        <p className="text-zinc-300 text-base mb-6">
                            Bạn đã có tài khoản?{" "}
                            <Link href="/login" className="text-red-500 hover:underline">
                                Đăng nhập ngay
                            </Link>
                        </p>

                        {/* Error message */}
                        {error && (
                            <p className="text-red-400 text-sm bg-red-950/30 border border-red-700 rounded-md p-2 mb-4">
                                {error}
                            </p>
                        )}
                        {!token && !error && (
                             <p className="text-yellow-400 text-sm bg-yellow-950/30 border border-yellow-700 rounded-md p-2 mb-4">
                                Đang tải token... Nếu lỗi, vui lòng kiểm tra lại link email.
                            </p>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <Label htmlFor="new-password" className="text-zinc-200 text-base mb-2">
                                    Nhập mật khẩu mới
                                </Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    placeholder="Nhập mật khẩu mới"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={isLoading || !token}
                                    className="bg-zinc-800/80 border-zinc-700 placeholder:text-zinc-600 text-base py-5"
                                />
                            </div>

                            <div>
                                <Label htmlFor="confirm-password" className="text-zinc-200 text-base mb-2">
                                    Nhập lại mật khẩu mới
                                </Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="Nhập lại mật khẩu mới"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading || !token}
                                    className="bg-zinc-800/80 border-zinc-700 placeholder:text-zinc-600 text-base py-5"
                                />
                            </div>

                            <Button 
                                type="submit"
                                disabled={isLoading || !token} 
                                className="bg-red-600 hover:bg-red-700 text-white w-full py-5 text-base font-semibold rounded-lg"
                            >
                                {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}