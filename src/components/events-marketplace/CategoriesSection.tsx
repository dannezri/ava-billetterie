import Link from 'next/link';

interface CategoriesSectionProps {
  categories: string[];
}

const CATEGORY_VISUALS: Record<string, { bg: string; text: string; emoji: string }> = {
  Pop:       { bg: 'bg-pink-50',    text: 'text-pink-700',    emoji: '🎤' },
  Rock:      { bg: 'bg-gray-100',   text: 'text-gray-700',    emoji: '🎸' },
  Rap:       { bg: 'bg-amber-50',   text: 'text-amber-700',   emoji: '🎤' },
  'Hip-Hop': { bg: 'bg-blue-50',    text: 'text-blue-700',    emoji: '🎧' },
  Électro:   { bg: 'bg-cyan-50',    text: 'text-cyan-700',    emoji: '🎛️' },
  Jazz:      { bg: 'bg-yellow-50',  text: 'text-yellow-700',  emoji: '🎷' },
  Reggae:    { bg: 'bg-emerald-50', text: 'text-emerald-700', emoji: '🎵' },
  Classique: { bg: 'bg-indigo-50',  text: 'text-indigo-700',  emoji: '🎻' },
  Metal:     { bg: 'bg-gray-100',   text: 'text-gray-800',    emoji: '🤘' },
  'R&B':     { bg: 'bg-rose-50',    text: 'text-rose-700',    emoji: '🎶' },
  Soul:      { bg: 'bg-orange-50',  text: 'text-orange-700',  emoji: '🎙️' },
  Folk:      { bg: 'bg-lime-50',    text: 'text-lime-700',    emoji: '🪕' },
  Country:   { bg: 'bg-yellow-50',  text: 'text-yellow-800',  emoji: '🤠' },
  Latin:     { bg: 'bg-red-50',     text: 'text-red-700',     emoji: '💃' },
  'K-Pop':   { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', emoji: '⭐' },
};

function getVisual(cat: string) {
  return CATEGORY_VISUALS[cat] ?? { bg: 'bg-gray-50', text: 'text-gray-700', emoji: '🎵' };
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Catégories populaires</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((cat) => {
          const { bg, text, emoji } = getVisual(cat);
          return (
            <Link
              key={cat}
              href={`/events?category=${encodeURIComponent(cat)}`}
              className={`group flex flex-col items-center justify-center gap-2 h-28 rounded-xl border border-gray-200 ${bg} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-gray-300`}
            >
              <span className="text-3xl">{emoji}</span>
              <p className={`text-sm font-semibold ${text}`}>{cat}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
