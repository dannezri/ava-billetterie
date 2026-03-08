import { CheckCircle2, Clock, RefreshCw, Shield } from 'lucide-react';

const guarantees = [
  {
    icon: Shield,
    title: '100% remboursé en cas de fraude',
    description:
      "Billet invalide ? Code-barres déjà utilisé ? Vous êtes intégralement remboursé sous 48h.",
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Clock,
    title: 'Séquestre automatique J+2',
    description:
      "L'argent reste bloqué 2 jours après l'événement. Le vendeur ne peut pas partir avec votre argent.",
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: CheckCircle2,
    title: 'Prix plafonné au prix facial',
    description:
      "Impossible de vendre au-dessus du prix d'origine. Nous bloquons toute surtarification abusive.",
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: RefreshCw,
    title: 'Support réactif 7j/7',
    description:
      "Une question ? Un problème ? Notre équipe répond en moins de 2h, même le week-end.",
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

export function Guarantees() {
  return (
    <section className="bg-gray-50 py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-gray-900">
            Nos garanties béton
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Ava s'engage à protéger chaque transaction. Votre tranquillité d'esprit est notre priorité.
          </p>
        </div>

        {/* Guarantees grid */}
        <div className="grid gap-5 md:grid-cols-2">
          {guarantees.map((guarantee, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-clean shadow-clean p-6 transition-all duration-200 hover:shadow-clean-md hover:border-blue-200"
            >
              <div className="flex gap-5">
                <div className="flex-shrink-0">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-clean ${guarantee.iconBg}`}>
                    <guarantee.icon className={`h-6 w-6 ${guarantee.iconColor}`} strokeWidth={2} />
                  </div>
                </div>
                <div>
                  <h3 className="mb-1.5 text-lg font-semibold text-gray-900">
                    {guarantee.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {guarantee.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-10 bg-white border border-gray-200 rounded-clean shadow-clean">
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="p-8 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">24h</div>
              <div className="text-sm text-gray-500">Délai moyen de résolution des litiges</div>
            </div>
            <div className="p-8 text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">100%</div>
              <div className="text-sm text-gray-500">Des fraudes détectées avant paiement</div>
            </div>
            <div className="p-8 text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">2.5M€</div>
              <div className="text-sm text-gray-500">Sécurisés en séquestre chaque mois</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
