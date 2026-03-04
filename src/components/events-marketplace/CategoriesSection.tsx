import Link from 'next/link';

interface CategoriesSectionProps {
  categories: string[];
}

const CATEGORY_VISUALS: Record<string, { gradient: string; emoji: string }> = {
  Pop: { gradient: 'from-pink-500 to-rose-600', emoji: '🎤' },
  Rock: { gradient: 'from-slate-700 to-slate-900', emoji: '🎸' },
  Rap: { gradient: 'from-amber-600 to-orange-700', emoji: '🎤' },
  'Hip-Hop': { gradient: 'from-purple-600 to-violet-800', emoji: '🎧' },
  Électro: { gradient: 'from-cyan-500 to-blue-700', emoji: '🎛️' },
  Jazz: { gradient: 'from-amber-700 to-yellow-900', emoji: '🎷' },
  Reggae: { gradient: 'from-green-600 to-emerald-800', emoji: '🎵' },
  Classique: { gradient: 'from-indigo-500 to-blue-800', emoji: '🎻' },
  Metal: { gradient: 'from-gray-700 to-black', emoji: '🤘' },
  'R&B': { gradient: 'from-rose-600 to-pink-800', emoji: '🎶' },
  Soul: { gradient: 'from-orange-500 to-amber-700', emoji: '🎙️' },
  Folk: { gradient: 'from-lime-600 to-green-800', emoji: '🪕' },
  Country: { gradient: 'from-yellow-600 to-amber-800', emoji: '🤠' },
  Latin: { gradient: 'from-red-500 to-orange-600', emoji: '💃' },
  'K-Pop': { gradient: 'from-fuchsia-500 to-purple-700', emoji: '⭐' },
};

function getVisual(cat: string) {
  return (
    CATEGORY_VISUALS[cat] ?? { gradient: 'from-slate-500 to-slate-700', emoji: '🎵' }
  );
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Catégories populaires</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((cat) => {
          const { gradient, emoji } = getVisual(cat);
          return (
            <Link
              key={cat}
              href={`/events?category=${encodeURIComponent(cat)}`}
              className="group relative flex h-36 items-end overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 transition-opacity duration-300 group-hover:opacity-100`}
              />

              {/* Emoji décoratif */}
              <span className="absolute right-4 top-4 text-4xl opacity-30 transition-opacity duration-300 group-hover:opacity-50">
                {emoji}
              </span>

              {/* Nom catégorie */}
              <div className="relative z-10 w-full p-4">
                <p className="font-bold text-white">{cat}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
