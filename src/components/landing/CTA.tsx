import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

export function CTA() {
  return (
    <section className="bg-blue-600 py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center">

          {/* Heading */}
          <h2 className="mb-5 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Prêt à vendre ou acheter en toute sécurité ?
          </h2>

          {/* Subheading */}
          <p className="mb-10 text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Rejoignez la plateforme de revente éthique qui protège vraiment ses utilisateurs.
            Pas d&apos;arnaque, pas de stress, juste des transactions sereines.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-gray-50 shadow-clean-md font-semibold gap-2"
              asChild
            >
              <Link href="/signup">
                Créer mon compte gratuit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="border border-blue-400 text-white hover:bg-blue-700 hover:text-white font-semibold"
              asChild
            >
              <Link href="/events">
                Voir les billets disponibles
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-blue-100">
            {[
              'Inscription en 2 minutes',
              'Sans carte bancaire',
              '100% gratuit pour les acheteurs',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-300 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
