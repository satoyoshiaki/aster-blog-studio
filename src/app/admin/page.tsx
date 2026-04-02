import { AdminLoginForm } from "@/components/night-bottle/admin-login-form";
import { AdminPanel } from "@/components/night-bottle/admin-panel";
import { isAdminSession } from "@/lib/admin-auth";
import { getAdminDashboardData } from "@/lib/service";

export default async function AdminPage() {
  if (!isAdminSession()) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <AdminLoginForm />
      </div>
    );
  }

  const { submissions, domains, keywords, reports } = await getAdminDashboardData();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-violet-300">Admin Console</p>
        <h1 className="text-4xl text-white">Night Bottle 管理画面</h1>
      </div>
      <AdminPanel domains={domains} keywords={keywords} reports={reports} submissions={submissions} />
    </div>
  );
}
