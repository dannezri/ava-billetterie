import { Shield, FileCheck, UserCheck, Lock, AlertCircle, Trophy } from 'lucide-react';

const features = [
  {
    icon: UserCheck,
    title: 'Vérification KYC obligatoire',
    description:
      'Tous les vendeurs passent par une vérification d\'identité Stripe Identity. Selfie + pièce d\'identité pour garantir l\'authenticité.',
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    icon: FileCheck,
    title: 'Détection automatique des doublons',
    description:
      'Chaque billet est analysé (hash SHA-256 + extraction code-barres). Impossible de vendre le même billet deux fois.',
    gradient: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
  {
    icon: Shield,
    title: 'Validation manuelle par notre équipe',
    description:
      'Avant publication, chaque billet est vérifié manuellement : lisibilité, prix ≤ prix facial, cohérence événement.',
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    icon: Lock,
    title: 'Séquestre bancaire Stripe',
    description:
      'L\'argent est bloqué jusqu\'à 2 jours après l\'événement. Protection totale contre les arnaques et billets invalides.',
    gradient: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
  },
  {
    icon: AlertCircle,
    title: 'Système de litiges intégré',
    description:
      'Un problème à l\'entrée ? Ouvrez un litige avec preuves. Notre équipe arbitre et peut rembourser intégralement.',
    gradient: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
  },
  {
    icon: Trophy,
    title: 'Score de confiance vendeur',
    description:
      'Chaque utilisateur a un trust score (0-100). 3 litiges perdus = suspension automatique du compte.',
    gradient: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
  },
];

export function Features() {
  return (
    <section className="bg-zinc-50 py-20 dark:bg-zinc-900 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-300">
            <Shield className="h-4 w-4" />
            <span>Sécurité maximale</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-5xl">
            Zéro risque, zéro arnaque
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Une architecture de sécurité multi-niveaux inspirée des standards bancaires
          </p>
        </div>

        {/* Features Grid */}
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5">
                <div className={`h-full w-full bg-gradient-to-br ${feature.gradient}`} />
              </div>

              {/* Icon */}
              <div className={`mb-6 inline-flex rounded-xl ${feature.bgColor} p-4`}>
                <feature.icon
                  className={`h-7 w-7 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`}
                  strokeWidth={2}
                />
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-bold text-zinc-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Security Badge */}
        <div className="mx-auto mt-16 max-w-4xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="flex-shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
                <Shield className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
                Conformité DSP2 européenne
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Notre infrastructure de paiement est conforme aux régulations bancaires européennes.
                Stripe Connect assure le séquestre et la traçabilité de chaque transaction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
