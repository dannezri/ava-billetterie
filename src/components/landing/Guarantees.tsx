import { CheckCircle2, Clock, RefreshCw, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';

const guarantees = [
  {
    icon: Shield,
    title: '100% remboursé en cas de fraude',
    description:
      'Billet invalide ? Code-barres déjà utilisé ? Vous êtes intégralement remboursé sous 48h.',
  },
  {
    icon: Clock,
    title: 'Séquestre automatique J+2',
    description:
      'L\'argent reste bloqué 2 jours après l\'événement. Le vendeur ne peut pas partir avec votre argent.',
  },
  {
    icon: CheckCircle2,
    title: 'Prix plafonné au prix facial',
    description:
      'Impossible de vendre au-dessus du prix d\'origine. Nous bloquons toute surtarification abusive.',
  },
  {
    icon: RefreshCw,
    title: 'Support réactif 7j/7',
    description:
      'Une question ? Un problème ? Notre équipe répond en moins de 2h, même le week-end.',
  },
];

export function Guarantees() {
  return (
    <section className="bg-gradient-to-b from-white to-zinc-50 py-20 dark:from-zinc-950 dark:to-zinc-900 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-5xl">
            Nos garanties béton
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Ava s'engage à protéger chaque transaction. Votre tranquillité d'esprit est notre priorité.
          </p>
        </div>

        {/* Guarantees Grid */}
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {guarantees.map((guarantee, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-2 p-8 transition-all hover:border-blue-500 hover:shadow-xl"
            >
              <div className="flex gap-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                    <guarantee.icon className="h-7 w-7 text-white" strokeWidth={2.5} />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">
                    {guarantee.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">{guarantee.description}</p>
                </div>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 opacity-0 transition-opacity group-hover:opacity-20 dark:from-blue-900 dark:to-purple-900" />
            </Card>
          ))}
        </div>

        {/* Trust Stats */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid gap-8 rounded-2xl border-2 border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-blue-600 dark:text-blue-500">
                24h
              </div>
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Délai moyen de résolution des litiges
              </div>
            </div>
            <div className="border-l border-zinc-200 text-center dark:border-zinc-800">
              <div className="mb-2 text-4xl font-bold text-green-600 dark:text-green-500">
                100%
              </div>
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Des fraudes détectées avant paiement
              </div>
            </div>
            <div className="border-l border-zinc-200 text-center dark:border-zinc-800">
              <div className="mb-2 text-4xl font-bold text-purple-600 dark:text-purple-500">
                2.5M€
              </div>
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Sécurisés en séquestre chaque mois
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
