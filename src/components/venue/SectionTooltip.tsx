'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ISectionPrice, IVenueSection } from './types';
import { CATEGORY_ACCENT, CATEGORY_FILL_SELECTED } from './venue-sections-config';
import { PriceTrendSparkline, type IPriceSnapshot } from './PriceTrendSparkline';

const CATEGORY_LABELS: Record<string, string> = {
  STANDING_PIT: 'Fosse Debout',
  SEATED_FLOOR: 'Parterre Assis',
  LOWER_TIER:   'Tribune Basse',
  MIDDLE_TIER:  'Tribune Moyenne',
  UPPER_TIER:   'Tribune Haute / Gradin',
  VIP_PREMIUM:  'Carré Or / VIP',
  VIP_LOGES:    'VIP Loges',
  ACCESSIBLE:   'Zone Accessible',
  STAGE:        'Scène',
};

interface ISectionTooltipProps {
  section: IVenueSection | null;
  price?: ISectionPrice;
  priceHistory?: IPriceSnapshot[];
  mouseX: number;
  mouseY: number;
}

export function SectionTooltip({ section, price, priceHistory, mouseX, mouseY }: ISectionTooltipProps) {
  const accentColor = section ? CATEGORY_ACCENT[section.category] : '#6B7280';
  const bgAccent    = section ? CATEGORY_FILL_SELECTED[section.category] : '#E5E7EB';

  // Keep tooltip within viewport
  const offsetX = mouseX > window.innerWidth  - 220 ? -210 : 16;
  const offsetY = mouseY > window.innerHeight - 160 ? -140 : 16;

  return (
    <AnimatePresence>
      {section && (
        <motion.div
          key={section.section_id}
          initial={{ opacity: 0, scale: 0.92, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 6 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className="pointer-events-none fixed z-[9999]"
          style={{ left: mouseX + offsetX, top: mouseY + offsetY }}
        >
          <div className="w-60 rounded-xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.14)] overflow-hidden">
            {/* Color bar */}
            <div className="h-1" style={{ background: bgAccent }} />

            <div className="p-3.5">
              {/* Category badge */}
              <span
                className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide mb-2"
                style={{ color: accentColor, background: `${bgAccent}40` }}
              >
                {CATEGORY_LABELS[section.category] ?? section.category}
              </span>

              {/* Section name */}
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {section.name}
              </p>

              {/* Pricing */}
              <div className="mt-2.5 border-t border-gray-100 pt-2.5">
                {price ? (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black" style={{ color: accentColor }}>
                        {Math.round(price.min_price)}€
                      </span>
                      {price.max_price > price.min_price + 5 && (
                        <span className="text-sm text-gray-400 font-medium">
                          – {Math.round(price.max_price)}€
                        </span>
                      )}
                    </div>
                  <p className="mt-1 text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">{price.tickets_count}</span>{' '}
                    billet{price.tickets_count > 1 ? 's' : ''} disponible{price.tickets_count > 1 ? 's' : ''}
                    {price.tickets_count <= 3 && (
                      <span className="ml-1 font-bold text-red-500">⚡ Stock limité</span>
                    )}
                  </p>

                  {/* Sparkline tendance */}
                  {priceHistory && priceHistory.length >= 2 && (
                    <div className="mt-2.5 border-t border-gray-100 pt-2.5">
                      <p className="mb-1.5 text-[10px] font-medium text-gray-400 uppercase tracking-wide">Tendance 7 jours</p>
                      <PriceTrendSparkline history={priceHistory} />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-400 italic">Aucun billet disponible</p>
              )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
