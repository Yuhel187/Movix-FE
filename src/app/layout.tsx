import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import AIChatWidget from "@/components/ai/AIChatWidget";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Movix",
  description: "Xem phim miễn phí chất lượng cao",
  icons: {
    icon: "/images/logo.png",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${manrope.className} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
          <AIChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}