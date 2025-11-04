'use client';
import { ProfileForm } from "@/components/account/AccountProfileForm";
import { AvatarUpload } from "@/components/account/AvatarUpload";

export default function ProfilePage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-white">Tài khoản</h1>
      <p className="mt-1 text-gray-400">
        Cập nhật thông tin tài khoản
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Cột trái: Form */}
        <div className="md:col-span-2">
          <ProfileForm />
        </div>
        
        {/* Cột phải: Avatar */}
        <div className="md:col-span-1">
          <AvatarUpload 
            currentAvatarUrl="https://i.pravatar.cc/300?u=dwayne-johnson" 
          />
        </div>
      </div>
    </div>
  );
}