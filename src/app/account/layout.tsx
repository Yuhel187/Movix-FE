import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { AccountNavigation } from "@/components/account/AccountNavigation";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black">
      <Navbar />
      
      {/* Layout 2 cột cho desktop (lg:flex).
        Trên mobile, chúng sẽ tự động xếp chồng lên nhau.
      */}
      <div className="lg:flex min-h-screen text-white">
        
        {/* Component này sẽ render:
          1. Sidebar (nếu là desktop)
          2. Dropdown (nếu là mobile)
        */}
        <AccountNavigation />

        {/* Nội dung chính (ProfileForm, AvatarUpload...).
          Chúng ta bỏ padding top (pt-0) trên mobile vì AccountNavigation
          sẽ xử lý padding cho cái dropdown của nó.
        */}
        <main className="flex-1 bg-zinc-950 px-4 pb-4 pt-0 md:px-8 md:pb-8 lg:p-12">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}