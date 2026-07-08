import DashboardSidebar from "@/components/shared/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <DashboardSidebar />
      <div className="md:pl-60">{children}</div>
    </div>
  );
}
