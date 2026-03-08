import { Shield, FileCheck, UserCheck, Lock, AlertCircle, Trophy } from 'lucide-react';

const features = [
  {
    icon: UserCheck,
    title: 'Vérification KYC obligatoire',
    description:
      "Tous les vendeurs passent par une vérification d'identité Stripe Identity. Selfie + pièce d'identité pour garantir l'authenticité.",
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: FileCheck,
    title: 'Détection automatique des doublons',
    description:
      "Chaque billet est analysé (hash SHA-256 + extraction code-barres). Impossible de vendre le même billet deux fois.",
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Shield,
    title: 'Validation manuelle par notre équipe',
    description:
      "Avant publication, chaque billet est vérifié manuellement : lisibilité, prix ≤ prix facial, cohérence événement.",
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Lock,
    title: 'Séquestre bancaire Stripe',
    description:
      "L'argent est bloqué jusqu'à 2 jours après l'événement. Protection totale contre les arnaques et billets invalides.",
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    icon: AlertCircle,
    title: 'Système de litiges intégré',
    description:
      "Un problème à l'entrée ? Ouvrez un litige avec preuves. Notre équipe arbitre et peut rembourser intégralement.",
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Trophy,
    title: 'Score de confiance vendeur',
    description:
      "Chaque utilisateur a un trust score (0-100). 3 litiges perdus = suspension automatique du compte.",
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
];

export function Features() {
  return (
    <section className="bg-gray-50 py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-clean-sm border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
            <Shield className="h-4 w-4" />
            <span>Sécurité maximale</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-gray-900">
            Zéro risque, zéro arnaque
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Une architecture de sécurité multi-niveaux inspirée des standards bancaires
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-clean shadow-clean p-8 transition-all duration-200 hover:shadow-clean-md hover:border-gray-300"
            >
              <div className={`mb-5 inline-flex rounded-clean-sm ${feature.iconBg} p-3`}>
                <feature.icon className={`h-6 w-6 ${feature.iconColor}`} strokeWidth={2} />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Compliance badge */}
        <div className="mx-auto mt-12 max-w-4xl bg-white border border-gray-200 rounded-clean shadow-clean p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-clean bg-emerald-50">
              <Shield className="h-7 w-7 text-emerald-600" strokeWidth={2} />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-semibold text-gray-900 mb-1.5">
                Conformité DSP2 européenne
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
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
