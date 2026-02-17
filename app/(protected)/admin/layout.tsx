import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server-client';

// Liste des emails admin (à mettre dans les variables d'environnement)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Vérifier si l'utilisateur est connecté
  if (!user) {
    redirect('/login');
  }

  // Vérifier si l'utilisateur est admin
  if (!ADMIN_EMAILS.includes(user.email || '')) {
    // Rediriger vers le dashboard si pas admin
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête admin */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Administration Ava
              </h2>
              <p className="text-sm text-gray-600">
                Connecté en tant que {user.email}
              </p>
            </div>
            <div className="flex gap-4">
              <a
                href="/admin/tickets/validation"
                className="text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                Validation billets
              </a>
              <a
                href="/admin/disputes"
                className="text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                Litiges
              </a>
              <a
                href="/dashboard"
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Retour au dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main>{children}</main>
    </div>
  );
}
