import { createClient } from '@/lib/supabase/server-client';
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar fixe */}
      <AdminSidebar userEmail={user?.email ?? undefined} />

      {/* Contenu principal (décalé de 256px = w-64 sidebar) */}
      <div className="flex-1 flex flex-col ml-64 min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
