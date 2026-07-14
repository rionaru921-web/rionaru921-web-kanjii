import DashboardSidebar from "@/components/shared/DashboardSidebar";
import GuestModeBanner from "@/components/dashboard/GuestModeBanner";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isGuest = !!user?.is_anonymous;

  return (
    <div className="min-h-screen">
      <DashboardSidebar />
      <div className="md:pl-60">
        {isGuest && (
          <div className="px-4 sm:px-8 pt-4">
            <GuestModeBanner />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
