"use client"; // Ensure this file is treated as a Client Component

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu và xác nhận mật khẩu không khớp!');
            return;
        }
        console.log('Password reset successfully');
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center p-4">
            <div className="absolute inset-0">
                <Image
                    src="https://image.tmdb.org/t/p/original/vVpEOvdxVBP2aV166j5Xlvb5Cdc.jpg"
                    alt="Background"
                    layout="fill"
                    objectFit="cover" // Ensures the image covers the whole screen
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
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <Label htmlFor="new-password" className="text-zinc-200 text-base">
                                    Nhập mật khẩu mới
                                </Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    placeholder="Nhập mật khẩu mới"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="bg-zinc-800/80 border-zinc-700 placeholder:text-zinc-600 text-base py-5"
                                />
                            </div>

                            <div>
                                <Label htmlFor="confirm-password" className="text-zinc-200 text-base">
                                    Nhập lại mật khẩu mới
                                </Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="Nhập lại mật khẩu mới"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-zinc-800/80 border-zinc-700 placeholder:text-zinc-600 text-base py-5"
                                />
                            </div>

                            <Button className="bg-red-600 hover:bg-red-700 text-white w-full py-5 text-base font-semibold rounded-lg">
                                Đặt lại mật khẩu
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
