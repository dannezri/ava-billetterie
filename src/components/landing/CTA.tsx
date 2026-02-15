import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-20 md:py-32">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-blue-500/20 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 h-full w-1/3 bg-gradient-to-l from-pink-500/20 to-transparent blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4" />
            <span>Rejoignez 50,000+ utilisateurs satisfaits</span>
          </div>

          {/* Heading */}
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            Prêt à vendre ou acheter en toute sécurité ?
          </h2>

          {/* Subheading */}
          <p className="mb-10 text-lg text-white/90 md:text-xl">
            Rejoignez la plateforme de revente éthique qui protège vraiment ses utilisateurs.
            Pas d&apos;arnaque, pas de stress, juste des transactions sereines.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="group h-14 gap-2 rounded-full bg-white px-10 text-base font-semibold text-zinc-900 shadow-2xl transition-all hover:bg-zinc-100 hover:shadow-xl"
              asChild
            >
              <Link href="/signup">
                Créer mon compte gratuit
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 gap-2 rounded-full border-2 border-white bg-transparent px-10 text-base font-semibold text-white hover:bg-white/10"
              asChild>
              <Link href="/events">
                Voir les billets disponibles
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-col items-center justify-center gap-6 text-sm text-white/80 md:flex-row md:gap-8">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Inscription en 2 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Sans carte bancaire</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>100% gratuit pour les acheteurs</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
