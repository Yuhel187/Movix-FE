"use client"; // Ensure this file is treated as a Client Component

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import ResetPasswordModal from '@/components/auth/ResetPasswordModal';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const emailExists = true;  

        if (emailExists) {
            setIsModalOpen(true); 
        } else {
            alert('Email not found');  
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center p-4">
            {/* Background */}
            <Image
                src="https://image.tmdb.org/t/p/original/vVpEOvdxVBP2aV166j5Xlvb5Cdc.jpg"
                alt="Background"
                fill
                className="absolute inset-0 -z-10 object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-black/70 -z-10" />

            {/* Box */}
            <div className="w-full max-w-4xl overflow-hidden rounded-xl bg-black/80 text-white shadow-[0_0_40px_rgba(255,0,0,0.4)] border border-zinc-800 backdrop-blur-xl">
                <div className="grid grid-cols-1 md:grid-cols-[0.7fr_1.3fr]">
                    {/* Left poster */}
                    <div className="hidden md:block relative h-[350px]">  {/* Reduced height */}
                        <Image
                            src="https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
                            alt="Poster"
                            fill
                            className="absolute inset-0 object-cover brightness-75"
                        />
                    </div>

                    {/* Form section */}
                    <div className="p-10 flex flex-col justify-center"> {/* Adjusted padding */}
                        <h2 className="text-3xl font-bold mb-2">Quên mật khẩu</h2>
                        <p className="text-zinc-300 text-base mb-6">
                            Bạn đã có tài khoản?{" "}
                            <Link href="/login" className="text-red-500 hover:underline">
                                Đăng nhập ngay
                            </Link>
                        </p>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <Label htmlFor="email" className="text-zinc-200 text-base">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Nhập email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-zinc-800/80 border-zinc-700 placeholder:text-zinc-600 text-base py-5"
                                />
                            </div>

                            <Button className="bg-red-600 hover:bg-red-700 text-white w-full py-5 text-base font-semibold rounded-lg">
                                Gửi yêu cầu
                            </Button>
                        </form>
                    </div>
                </div>

                {isModalOpen && (
                    <ResetPasswordModal
                        open={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                    />
                )}
            </div>
        </main>
    );
}
