"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const ACCESS_CODE = process.env.NEXT_PUBLIC_ACCESS_CODE || "MOVIX_2026";
const STORAGE_KEY = "movix_access_granted";

export default function AccessGateway() {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage on mount
    const granted = localStorage.getItem(STORAGE_KEY);
    if (granted === "true") {
      setIsAuthorized(true);
    }
    setLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ACCESS_CODE) {
      localStorage.setItem(STORAGE_KEY, "true");
      setIsAuthorized(true);
    } else {
      setError("Mã giới thiệu không chính xác. Vui lòng liên hệ quản trị viên.");
    }
  };

  if (loading) return null; // Prevent flash during hydration
  if (isAuthorized) return null; // Do not render if access is granted

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300 dark">
      <Card className="w-full max-w-md border-destructive/50 bg-background/90 shadow-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-destructive/50 to-destructive" />
        
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto pb-2">
             <Image 
                src="/images/logo.png" 
                alt="Movix Logo" 
                width={120} 
                height={40} 
                className="mx-auto h-auto w-auto"
                priority
             />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-destructive tracking-tight">
              Cảnh Báo Truy Cập
            </CardTitle>
            <CardDescription className="text-base font-medium">
              Movix - Dự án học tập & Nghiên cứu
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4">
          <div className="text-sm text-muted-foreground text-center bg-muted/40 p-4 rounded-lg border border-border/50">
            <p className="leading-relaxed">
              Trang web này được xây dựng mang tính chất thực hành kỹ thuật, 
              <strong> hoàn toàn phi lợi nhuận</strong> và không phục vụ mục đích thương mại.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="access-code" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Nhập mã giới thiệu
              </label>
              <Input
                id="access-code"
                type="text"
                placeholder="Ví dụ: MOVIX_..."
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                className={`h-11 transition-all ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
                autoComplete="off"
              />
              {error && (
                <p className="text-sm text-destructive font-medium flex items-center gap-2 animate-in slide-in-from-left-1">
                  Alert: {error}
                </p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full font-bold h-11 text-base shadow-md hover:shadow-lg transition-all" 
              size="lg"
            >
              Xác nhận truy cập
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="justify-center border-t py-4 bg-muted/20">
          <p className="text-xs text-muted-foreground font-mono">
            Educational Purpose Only • Movix 2026
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
