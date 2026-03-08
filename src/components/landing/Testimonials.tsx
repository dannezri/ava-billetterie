import { Star } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const testimonials = [
  {
    name: 'Sophie Martin',
    role: 'Acheteuse',
    initials: 'SM',
    rating: 5,
    text: "J'avais peur de me faire arnaquer en achetant un billet sur internet. Avec Ava, j'étais rassurée : vérification du vendeur, séquestre... Billet reçu en 2 minutes, entrée sans problème !",
  },
  {
    name: 'Thomas Dubois',
    role: 'Vendeur',
    initials: 'TD',
    rating: 5,
    text: "Je ne pouvais plus aller au concert de Coldplay. J'ai mis mon billet en ligne, il s'est vendu en 4h. L'argent est arrivé 2 jours après le concert, comme promis. Hyper simple.",
  },
  {
    name: 'Léa Rousseau',
    role: 'Acheteuse',
    initials: 'LR',
    rating: 5,
    text: "J'ai acheté 3 billets pour un festival. Un vendeur avait un bon trust score, les billets étaient vérifiés. Aucun stress le jour J, tout était nickel. Je recommande à 100% !",
  },
  {
    name: 'Maxime Leroy',
    role: 'Vendeur',
    initials: 'ML',
    rating: 5,
    text: "Premier site où je me sens en sécurité en vendant. Le KYC est rassurant et le séquestre protège tout le monde. Parfait pour vendre en confiance.",
  },
  {
    name: 'Camille Petit',
    role: 'Acheteuse',
    initials: 'CP',
    rating: 5,
    text: "Le billet était refusé à l'entrée. J'ai ouvert un litige avec une photo, j'ai été remboursée en 24h. Le support a été réactif et pro. Vraiment top !",
  },
  {
    name: 'Alexandre Bernard',
    role: 'Vendeur',
    initials: 'AB',
    rating: 5,
    text: "J'ai vendu 5 billets en 2 mois. À chaque fois, transaction fluide. Le fait que les prix soient plafonnés au prix facial, c'est éthique et ça rassure les acheteurs.",
  },
];

const avatarColors = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-violet-600',
  'bg-blue-500',
  'bg-amber-600',
  'bg-gray-600',
];

export function Testimonials() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-clean-sm border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">
            <Star className="h-4 w-4 fill-current" />
            <span>4.9/5 · Plus de 2 000 avis</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-gray-900">
            Ils nous font confiance
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Découvrez les témoignages de notre communauté
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-clean shadow-clean p-7 transition-all duration-200 hover:shadow-clean-md hover:border-gray-300 flex flex-col"
            >
              {/* Rating */}
              <div className="mb-4 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Text */}
              <p className="mb-6 text-sm leading-relaxed text-gray-600 flex-1">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className={`${avatarColors[index % avatarColors.length]} text-xs font-semibold text-white`}>
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-gray-500">
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
