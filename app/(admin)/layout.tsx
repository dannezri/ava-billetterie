import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server-client';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?returnUrl=/admin');
  }

  if (!ADMIN_EMAILS.includes(user.email || '')) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
