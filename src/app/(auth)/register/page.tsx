"use client";

import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation"; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OtpModal from "@/components/auth/OtpModal";
import apiClient from "@/lib/apiClient"; 
import { toast } from "sonner"; 

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); 

  const handleValidate = () => {
    if (username.trim().length < 4) {
      return "Tên đăng nhập phải ≥ 4 ký tự!";
    }
    if (!email.includes("@") || !email.includes(".")) {
      return "Email không hợp lệ!";
    }
    if (password.length < 6) {
      return "Mật khẩu phải ≥ 6 ký tự!";
    }
    if (password !== confirm) {
      return "Mật khẩu xác nhận không khớp!";
    }
    return "";
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    const msg = handleValidate();

    if (msg !== "") {
      setError(msg);
      return;
    }
    
    setError("");
    setIsLoading(true);

    try {
      await apiClient.post("/auth/register", {
        email,
        username,
        password,
      });
      toast.success("Đăng ký thành công! Vui lòng kiểm tra email.");
      setOtpOpen(true);

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

  const handleVerify = async (code: string) => {
    setError("");
    setIsLoading(true);

    try {
      await apiClient.post("/auth/verify", {
        email: email,
        verificationCode: code,
      });

      setOtpOpen(false);
      toast.success("Xác thực thành công! Vui lòng đăng nhập.");
      router.push("/login"); 

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); 
      } else {
        setError("Lỗi xác thực. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError("");
    try {
      await apiClient.post('/auth/resend-verification', { email });
      toast.success("Đã gửi lại mã OTP. Vui lòng kiểm tra email.");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Lỗi. Vui lòng thử lại sau.");
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
        <div className="grid grid-cols-1 md:grid-cols-[0.7fr_1.3fr] min-h-[650px]">
          {/* Left poster */}
          <div className="hidden md:block relative h-full">
            <Image
              src="https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
              alt="Poster"
              fill
              className="absolute inset-0 object-cover object-center brightness-75"
            />
          </div>

          {/* Form */}
          <div className="p-15 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-2">Đăng ký</h2>
            <p className="text-zinc-300 text-base mb-6">
              Bạn đã có tài khoản?{" "}
              <Link href="/login" className="text-red-500 hover:underline">
                đăng nhập ngay
              </Link>
            </p>

            <form className="space-y-5" onSubmit={handleRegister}>
              {error && !otpOpen && ( 
                <p className="text-red-400 text-sm bg-red-950/30 border border-red-700 rounded-md p-2">
                  {error}
                </p>
              )}

              <div>
                <Label className="text-zinc-200 text-base mb-2">
                  Tên đăng nhập
                </Label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  className="bg-zinc-800/80 border-zinc-700 placeholder:text-zinc-500 text-base py-5"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label className="text-zinc-200 text-base mb-2">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email"
                  className="bg-zinc-800/80 border-zinc-700 placeholder:text-zinc-500 text-base py-5"
                  disabled={isLoading || otpOpen} 
                />
              </div>

              <div>
                <Label className="text-zinc-200 text-base mb-2">Mật khẩu</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="bg-zinc-800/80 border-zinc-700 placeholder:text-zinc-500 text-base py-5"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label className="text-zinc-200 text-base mb-2">
                  Xác nhận mật khẩu
                </Label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="bg-zinc-800/80 border-zinc-700 placeholder:text-zinc-500 text-base py-5"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit" 
                disabled={isLoading} 
                className="bg-red-600 hover:bg-red-700 text-white w-full py-5 text-base font-semibold"
              >
                {isLoading ? "Đang xử lý..." : "Đăng ký"}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                className="bg-slate-200 text-slate-900 hover:bg-slate-300 w-full py-5 text-base font-semibold"
              >
                <FcGoogle className="mr-2 h-5 w-5" />
                Đăng ký bằng Google
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* OTP Popup */}
      <OtpModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        onVerify={handleVerify}
        isLoading={isLoading} 
        targetEmail={email} 
        onResend={handleResend} 
        apiError={error} 
      />
    </main>
  );
}