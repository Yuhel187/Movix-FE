"use client";
import { useRouter } from "next/navigation"; 
import { Button } from "@/components/ui/button";

export default function ResetPasswordModal({ open, onClose }: any) {
  const router = useRouter();  

  if (!open) return null;

  const handleRedirect = () => {
    onClose(); 
    router.push("/login"); 
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-black/85 text-white w-[380px] p-6 rounded-xl shadow-[0_0_30px_rgba(255,0,0,0.5)] border border-zinc-700 backdrop-blur-xl">
        <h2 className="text-3xl text-center font-bold mb-2">Kiểm tra email của bạn</h2>
        <p className="text-zinc-300 text-center text-sm mb-6">
          Một liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn.
        </p>

        <Button
          onClick={handleRedirect}  
          className="bg-red-600 hover:bg-red-700 w-full py-5 text-lg font-semibold rounded-lg"
        >
          Đã hiểu
        </Button>
      </div>
    </div>
  );
}
