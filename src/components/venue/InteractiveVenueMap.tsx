'use client';

import { useRef, useCallback, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { ZoomIn, ZoomOut, RotateCcw, Sparkles, RotateCw } from 'lucide-react';
import { CardClean } from '@/components/ui/card-clean';
import { BadgeClean } from '@/components/ui/badge-clean';
import { VenueSection } from './VenueSection';
import { PriceMarker } from './PriceMarker';
import { SectionTooltip } from './SectionTooltip';
import { PriceRangeFilter } from './PriceRangeFilter';
import { SeatAssistantModal } from './SeatAssistantModal';
import { SectionHeatmapOverlay } from './SectionHeatmapOverlay';
import { CATEGORY_FILL_SELECTED } from './venue-sections-config';
import type { ISeatmap, ISectionPrice, IVenueSection } from './types';
import type { IPriceSnapshot } from './PriceTrendSparkline';

interface IInteractiveVenueMapProps {
  seatmap: ISeatmap;
  sectionPrices: Map<string, ISectionPrice>;
  hoveredSectionId: string | null;
  selectedSectionIds: Set<string>;
  priceRange: [number, number];
  globalPriceMin: number;
  globalPriceMax: number;
  mouseX: number;
  mouseY: number;
  priceHistory?: Record<string, IPriceSnapshot[]>;
  sectionAnalytics?: Record<string, { views_count: number; clicks_count: number }>;
  eventTitle?: string;
  onSectionHover: (section: IVenueSection | null) => void;
  onSectionClick: (sectionId: string, shiftKey: boolean) => void;
  onPriceRangeChange: (range: [number, number]) => void;
}

const STAGE_LABELS: Record<string, string> = {
  FRONTAL:   'Scène frontale',
  ROUND_360: 'Configuration 360°',
  ARENA:     'Configuration arène',
  THEATER:   'Configuration théâtre',
  FESTIVAL:  'Outdoor / Festival',
};

const STAGE_BADGE_VARIANT: Record<string, 'default' | 'blue' | 'green' | 'amber'> = {
  FRONTAL:   'default',
  ROUND_360: 'blue',
  ARENA:     'green',
  THEATER:   'default',
  FESTIVAL:  'amber',
};

export function InteractiveVenueMap({
  seatmap,
  sectionPrices,
  hoveredSectionId,
  selectedSectionIds,
  priceRange,
  globalPriceMin,
  globalPriceMax,
  mouseX,
  mouseY,
  priceHistory = {},
  sectionAnalytics = {},
  eventTitle = 'Événement',
  onSectionHover,
  onSectionClick,
  onPriceRangeChange,
}: IInteractiveVenueMapProps) {
  const badgeVariant    = STAGE_BADGE_VARIANT[seatmap.stageSetup] ?? 'default';
  const svgRef          = useRef<SVGSVGElement>(null);
  const [aiOpen,       setAiOpen]       = useState(false);
  const [heatmapOn,    setHeatmapOn]    = useState(false);
  const [rotation,     setRotation]     = useState(0);
  const is360 = seatmap.stageSetup === 'ROUND_360';

  // Pre-compute max score for colour normalisation
  const maxHeatScore = Object.values(sectionAnalytics).reduce((max, d) => {
    const s = d.views_count + d.clicks_count * 3;
    return s > max ? s : max;
  }, 0);

  const hoveredSection = hoveredSectionId
    ? seatmap.sections.find((s) => s.section_id === hoveredSectionId) ?? null
    : null;

  const handleSectionClick = useCallback(
    (sectionId: string) => () => {
      onSectionClick(sectionId, false);
    },
    [onSectionClick]
  );

  return (
    <>
      <CardClean className="p-5">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Plan de la salle</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Cliquez une zone · <kbd className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px] text-gray-500">⇧ Shift</kbd> pour multi-sélection
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAiOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 ring-1 ring-violet-200 transition hover:bg-violet-100"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ma place idéale
            </button>
            {maxHeatScore > 0 && (
              <button
                onClick={() => setHeatmapOn((v) => !v)}
                className={[
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 transition',
                  heatmapOn
                    ? 'bg-orange-100 text-orange-700 ring-orange-300'
                    : 'bg-gray-50 text-gray-500 ring-gray-200 hover:bg-gray-100',
                ].join(' ')}
                title="Afficher le heatmap de popularité"
              >
                🔥 Heatmap
              </button>
            )}
            <BadgeClean variant={badgeVariant}>
              {STAGE_LABELS[seatmap.stageSetup] ?? seatmap.stageSetup}
            </BadgeClean>
          </div>
        </div>

        {/* 360° rotation control */}
        {is360 && (
          <div className="mb-3 rounded-xl border border-purple-200 bg-purple-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <RotateCw className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-semibold text-purple-800">Vue 360° — Rotation interactive</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-purple-600">{rotation}°</span>
                <button
                  onClick={() => setRotation(0)}
                  className="rounded px-1.5 py-0.5 text-[10px] text-purple-500 transition hover:bg-purple-100"
                >
                  Reset
                </button>
              </div>
            </div>
            <SliderPrimitive.Root
              value={[rotation]}
              onValueChange={([v]) => setRotation(v)}
              min={0}
              max={345}
              step={15}
              className="relative flex h-5 w-full touch-none select-none items-center"
            >
              <SliderPrimitive.Track className="relative h-1.5 w-full grow rounded-full bg-purple-200">
                <SliderPrimitive.Range className="absolute h-full rounded-full bg-purple-500" />
              </SliderPrimitive.Track>
              <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-purple-500 bg-white shadow transition hover:scale-110 focus:outline-none" />
            </SliderPrimitive.Root>
          </div>
        )}

        {/* SVG avec Zoom/Pan */}
        <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50 min-h-[420px] sm:min-h-[520px]">
          <TransformWrapper
            initialScale={1}
            minScale={0.6}
            maxScale={4}
            centerOnInit
            limitToBounds
            panning={{ velocityDisabled: true }}
            wheel={{ step: 0.08 }}
            pinch={{ step: 5 }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Zoom controls — always visible bar at top of map */}
                <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/80 px-3 py-2 backdrop-blur-sm">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => zoomIn()}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm transition hover:border-blue-400 hover:bg-blue-50"
                      title="Zoom avant"
                    >
                      <ZoomIn className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => zoomOut()}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm transition hover:border-blue-400 hover:bg-blue-50"
                      title="Zoom arrière"
                    >
                      <ZoomOut className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => resetTransform()}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm transition hover:border-blue-400 hover:bg-blue-50"
                      title="Réinitialiser la vue"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    <span className="hidden sm:inline">🖱 Scroll pour zoomer · Glisser pour déplacer</span>
                    <span className="sm:hidden">📱 Pincez pour zoomer</span>
                  </p>
                </div>

                <TransformComponent
                  wrapperStyle={{ width: '100%', minHeight: '420px', paddingTop: '44px' }}
                  contentStyle={{ width: '100%' }}
                >
                  <svg
                    ref={svgRef}
                    viewBox={`0 0 ${seatmap.viewboxWidth} ${seatmap.viewboxHeight}`}
                    className="w-full h-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label={`Plan de salle — ${seatmap.configurationName}`}
                    style={is360 && rotation !== 0 ? {
                      transform: `rotate(${rotation}deg)`,
                      transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                      transformOrigin: 'center center',
                    } : undefined}
                  >
                    <rect x={0} y={0} width={seatmap.viewboxWidth} height={seatmap.viewboxHeight} fill="#F9FAFB" />

                    {/* Sections */}
                    {seatmap.sections.map((section) => {
                      const price = sectionPrices.get(section.section_id);
                      return (
                        <VenueSection
                          key={section.section_id}
                          section={section}
                          isHovered={hoveredSectionId === section.section_id}
                          isSelected={selectedSectionIds.has(section.section_id)}
                          hasTickets={sectionPrices.has(section.section_id)}
                          ticketsCount={price?.tickets_count ?? 0}
                          onHover={() => onSectionHover(section)}
                          onLeave={() => onSectionHover(null)}
                          onClick={handleSectionClick(section.section_id)}
                        />
                      );
                    })}

                    {/* Heatmap overlay (if active) */}
                    {heatmapOn && seatmap.sections.map((section) => {
                      const data = sectionAnalytics[section.section_id];
                      if (!data || section.category === 'STAGE') return null;
                      return (
                        <SectionHeatmapOverlay
                          key={`heat-${section.section_id}`}
                          svgPath={section.svg_path}
                          fillRule={section.fill_rule}
                          analytics={data}
                          maxScore={maxHeatScore}
                        />
                      );
                    })}

                    {/* Section labels (stage only + empty primaries) */}
                    {seatmap.sections.map((section) => {
                      const isSelected  = selectedSectionIds.has(section.section_id);
                      const isHovered   = hoveredSectionId === section.section_id;
                      const hasTickets  = sectionPrices.has(section.section_id);
                      const isStage     = section.category === 'STAGE';

                      if (hasTickets && !isStage) return null;

                      const isPrimary = ['STAGE', 'STANDING_PIT', 'UPPER_TIER', 'VIP_PREMIUM', 'SEATED_FLOOR'].includes(section.category);
                      const showOnHover = isHovered || isSelected;
                      if (!isStage && !isPrimary && !showOnHover) return null;

                      return (
                        <text
                          key={`lbl-${section.section_id}`}
                          x={section.label_x}
                          y={section.label_y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={showOnHover && !isStage ? '#374151' : isStage ? '#9CA3AF' : '#C4C9D4'}
                          fontSize={isStage ? 20 : 16}
                          fontWeight={isSelected || isHovered ? '700' : isStage ? '600' : '400'}
                          letterSpacing={isStage ? '2' : '0'}
                          fontFamily="Inter, system-ui, sans-serif"
                          style={{ transition: 'fill 200ms ease', pointerEvents: 'none', userSelect: 'none' }}
                        >
                          {isStage ? section.name.toUpperCase() : section.name}
                        </text>
                      );
                    })}

                    {/* Price markers */}
                    {Array.from(sectionPrices.entries()).map(([sectionId, data], idx) => {
                      const section = seatmap.sections.find((s) => s.section_id === sectionId);
                      if (!section || section.category === 'STAGE') return null;

                      const inRange = data.min_price >= priceRange[0] && data.min_price <= priceRange[1];

                      return (
                        <PriceMarker
                          key={`price-${sectionId}`}
                          x={section.label_x}
                          y={section.label_y}
                          sectionName={section.name}
                          minPrice={data.min_price}
                          maxPrice={data.max_price}
                          ticketsCount={data.tickets_count}
                          isHovered={hoveredSectionId === sectionId}
                          isSelected={selectedSectionIds.has(sectionId)}
                          category={section.category}
                          animationDelay={idx * 0.05}
                          dimmed={!inRange}
                        />
                      );
                    })}
                  </svg>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>

        {/* Price filter */}
        {globalPriceMin < globalPriceMax && (
          <div className="mt-3">
            <PriceRangeFilter
              globalMin={globalPriceMin}
              globalMax={globalPriceMax}
              range={priceRange}
              onRangeChange={onPriceRangeChange}
            />
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded border-2" style={{ backgroundColor: '#DBEAFE', borderColor: '#93C5FD' }} />
            <span className="font-medium">Fosse / Debout</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded border-2" style={{ backgroundColor: '#EDE9FE', borderColor: '#C4B5FD' }} />
            <span className="font-medium">Tribunes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded border-2" style={{ backgroundColor: '#FED7AA', borderColor: '#FB923C' }} />
            <span className="font-medium">VIP / Carré Or</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded border-2 border-red-400 bg-red-100" />
            <span className="font-medium text-red-600">⚡ Stock limité (&lt;3)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded border border-gray-200 bg-gray-100 opacity-40" />
            <span className="font-medium">Indisponible</span>
          </div>
        </div>
      </CardClean>

      {/* Floating tooltip (rendered outside card to escape overflow:hidden) */}
      <SectionTooltip
        section={hoveredSection}
        price={hoveredSection ? sectionPrices.get(hoveredSection.section_id) : undefined}
        priceHistory={hoveredSection ? priceHistory[hoveredSection.section_id] : undefined}
        mouseX={mouseX}
        mouseY={mouseY}
      />

      {/* IA Assistant modal */}
      <SeatAssistantModal
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        eventTitle={eventTitle}
        sections={seatmap.sections}
        sectionPrices={sectionPrices}
        onRecommendation={(sectionId) => {
          onSectionClick(sectionId, false);
          setAiOpen(false);
        }}
      />
    </>
  );
}
