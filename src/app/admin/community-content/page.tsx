import BlogManager from "@/components/admin/community/BlogManager";

export const metadata = {
  title: "Quản lý Blog & Đánh giá - Movix Admin",
  description: "Duyệt bài viết của cộng đồng và xử lý các báo cáo vi phạm.",
};

export default function CommunityContentPage() {
  return <BlogManager />;
}