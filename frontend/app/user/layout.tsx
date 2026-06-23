import UserDashboardShell from "../../components/user/UserDashboardShell";
import BusinessRouteGuard from "../../components/auth/BusinessRouteGuard";
import UserToastProvider from "../../components/user/UserToastProvider";

export const metadata = {
  title: "User Dashboard | Tijaruk",
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <BusinessRouteGuard>
      <UserToastProvider>
        <div className="min-h-screen bg-[#f7f4f7] text-[#161616]">
          <UserDashboardShell>{children}</UserDashboardShell>
        </div>
      </UserToastProvider>
    </BusinessRouteGuard>
  );
}
