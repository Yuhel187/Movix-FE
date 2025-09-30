import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap", 
  weight: ["400", "500", "600", "700", "800"], 
});

export const metadata: Metadata = {
  title: "Movix",
  description: "Xem phim miễn phí chất lượng cao",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${manrope.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
