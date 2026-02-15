import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const testimonials = [
  {
    name: 'Sophie Martin',
    role: 'Acheteuse',
    initials: 'SM',
    rating: 5,
    text: 'J\'avais peur de me faire arnaquer en achetant un billet sur internet. Avec Ava, j\'étais rassurée : vérification du vendeur, séquestre... Billet reçu en 2 minutes, entrée sans problème !',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    name: 'Thomas Dubois',
    role: 'Vendeur',
    initials: 'TD',
    rating: 5,
    text: 'Je ne pouvais plus aller au concert de Coldplay. J\'ai mis mon billet en ligne, il s\'est vendu en 4h. L\'argent est arrivé 2 jours après le concert, comme promis. Hyper simple.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Léa Rousseau',
    role: 'Acheteuse',
    initials: 'LR',
    rating: 5,
    text: 'J\'ai acheté 3 billets pour un festival. Un vendeur avait un bon trust score, les billets étaient vérifiés. Aucun stress le jour J, tout était nickel. Je recommande à 100% !',
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    name: 'Maxime Leroy',
    role: 'Vendeur',
    initials: 'ML',
    rating: 5,
    text: 'Premier site où je me sens en sécurité en vendant. Le KYC est rassurant (ça filtre les arnaqueurs) et le séquestre protège tout le monde. Parfait pour vendre en confiance.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Camille Petit',
    role: 'Acheteuse',
    initials: 'CP',
    rating: 5,
    text: 'Le billet était scanné à l\'entrée mais ne passait pas. J\'ai ouvert un litige avec une photo, j\'ai été remboursée en 24h. Le support a été réactif et pro. Vraiment top !',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    name: 'Alexandre Bernard',
    role: 'Vendeur',
    initials: 'AB',
    rating: 5,
    text: 'J\'ai vendu 5 billets en 2 mois. À chaque fois, transaction fluide, pas de prise de tête. Le fait que les prix soient plafonnés au prix facial, c\'est éthique et ça rassure les acheteurs.',
    gradient: 'from-indigo-500 to-violet-500',
  },
];

export function Testimonials() {
  return (
    <section className="bg-white py-20 dark:bg-zinc-950 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950/20 dark:text-yellow-300">
            <Star className="h-4 w-4 fill-current" />
            <span>4.9/5 • Plus de 2,000 avis</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-5xl">
            Ils nous font confiance
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Découvrez les témoignages de notre communauté
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Quote Icon */}
              <div className="absolute -right-4 -top-4 opacity-5">
                <Quote className="h-24 w-24" />
              </div>

              {/* Rating */}
              <div className="mb-4 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="relative mb-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar className={`h-10 w-10 bg-gradient-to-br ${testimonial.gradient}`}>
                  <AvatarFallback className="bg-transparent text-sm font-semibold text-white">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-500">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
