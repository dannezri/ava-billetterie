import { Upload, ShieldCheck, Banknote } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Déposez votre billet',
    description:
      "Uploadez votre billet PDF en quelques clics. Notre système vérifie automatiquement son authenticité et détecte les doublons.",
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: ShieldCheck,
    title: 'Transaction sécurisée',
    description:
      "L'argent est bloqué en séquestre jusqu'au jour du concert. Vous êtes protégé contre toute arnaque.",
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Banknote,
    title: 'Recevez votre argent',
    description:
      "2 jours après l'événement, les fonds sont automatiquement libérés. Simple, rapide et sans risque.",
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-gray-900">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Trois étapes simples pour une revente en toute confiance
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-white border border-gray-200 rounded-clean shadow-clean p-8 transition-all duration-200 hover:shadow-clean-md hover:border-gray-300"
            >
              {/* Step number */}
              <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-clean">
                {index + 1}
              </div>

              {/* Icon */}
              <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-clean ${step.iconBg}`}>
                <step.icon className={`h-7 w-7 ${step.iconColor}`} strokeWidth={2} />
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {step.description}
              </p>

              {/* Progress bar */}
              <div className="mt-6 h-0.5 w-0 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
