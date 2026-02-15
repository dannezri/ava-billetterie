import { Upload, ShieldCheck, Banknote } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Déposez votre billet',
    description:
      'Uploadez votre billet PDF en quelques clics. Notre système vérifie automatiquement son authenticité et détecte les doublons.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    icon: ShieldCheck,
    title: 'Transaction sécurisée',
    description:
      'L\'argent est bloqué en séquestre jusqu\'au jour du concert. Vous êtes protégé contre toute arnaque.',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
  {
    icon: Banknote,
    title: 'Recevez votre argent',
    description:
      '2 jours après l\'événement, les fonds sont automatiquement libérés. Simple, rapide et sans risque.',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-20 dark:bg-zinc-950 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-5xl">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Trois étapes simples pour une revente en toute confiance
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative flex flex-col items-start rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Step Number */}
              <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700 font-bold text-white shadow-lg dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900">
                {index + 1}
              </div>

              {/* Icon */}
              <div
                className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${step.bgColor}`}
              >
                <step.icon
                  className={`h-8 w-8 bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}
                  strokeWidth={2}
                />
              </div>

              {/* Content */}
              <h3 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                {step.description}
              </p>

              {/* Decorative gradient bar */}
              <div
                className={`mt-6 h-1 w-0 rounded-full bg-gradient-to-r ${step.color} transition-all duration-300 group-hover:w-full`}
              />
            </div>
          ))}
        </div>

        {/* Visual Connection Lines (Desktop) */}
        <div className="relative -mt-4 hidden md:block">
          <div className="mx-auto flex max-w-6xl justify-between px-8">
            <div className="flex-1" />
            <div className="relative flex-1">
              <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-900 dark:to-purple-900" />
            </div>
            <div className="relative flex-1">
              <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-purple-200 to-green-200 dark:from-purple-900 dark:to-green-900" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
