"use client"; 

import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FormEvent, useState } from "react"; 
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext"; 
import apiClient from "@/lib/apiClient"; 
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth(); 

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await apiClient.post("/auth/login", {
        email,
        password,
      });

      const { accessToken, refreshToken, ...user } = res.data.data;

      login(user, accessToken, refreshToken);

      toast.success("Đăng nhập thành công!");
      
      if (user.role === "Admin") {
        router.push("/admin"); 
      } else {
        router.push("/movies");
      }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Không thể đăng nhập. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
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
      <div className="w-full max-w-6xl overflow-hidden rounded-xl bg-black/80 text-white shadow-[0_0_40px_rgba(255,0,0,0.4)] border border-zinc-800 backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-[0.7fr_1.3fr]">
          {/* Left poster */}
          <div className="hidden md:block relative h-[650px]">
            <Image
              src="https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
              alt="Poster"
              fill
              className="absolute inset-0 object-cover brightness-75"
            />
          </div>

          {/* Form */}
          <div className="p-15 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-2">Đăng nhập</h2>
            <p className="text-zinc-300 text-base mb-6">
              Bạn chưa có tài khoản?{" "}
              <Link href="/register" className="text-red-500 hover:underline">
                đăng ký ngay
              </Link>
            </p>

            {/* 12. Kết nối form với state và handler */}
            <form className="space-y-5" onSubmit={handleLogin}>
              {error && (
                <p className="text-red-400 text-sm bg-red-950/30 border border-red-700 rounded-md p-2">
                  {error}
                </p>
              )}
              <div>
                <Label htmlFor="email" className="text-zinc-200 text-base mb-2">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email"
                  className="bg-zinc-800/80 border-zinc-700 placeholder:text-zinc-600 text-base py-5"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="text-zinc-200 text-base mb-2"
                >
                  Mật khẩu
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="bg-zinc-800/80 border-zinc-700 placeholder:text-zinc-600 text-base py-5"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white w-full py-5 text-base font-semibold rounded-lg"
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>

              <Link
                href="/forgot-password"
                className="text-sm text-zinc-300 hover:underline text-center block"
              >
                Quên mật khẩu?
              </Link>

              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                className="bg-slate-200 text-slate-900 hover:bg-slate-300 w-full py-5 text-base font-semibold rounded-lg"
              >
                <FcGoogle className="mr-2 h-5 w-5" />
                Đăng nhập bằng Google
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}