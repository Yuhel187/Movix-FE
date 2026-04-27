import ViolationReportPage from "@/components/admin/violation-reports/ViolationReportPage";

export const metadata = {
  title: "Quản lý Báo cáo vi phạm - Admin",
  description: "Trang quản lý các nội dung vi phạm do cộng đồng báo cáo.",
};

export default function Page() {
  return <ViolationReportPage />;
}
