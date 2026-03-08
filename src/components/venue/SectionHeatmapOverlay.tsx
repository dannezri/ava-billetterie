'use client';

/**
 * Renders a translucent red overlay on each section, proportional to
 * its view/click count relative to the most-viewed section (maxViews).
 * Layered ABOVE VenueSection paths, pointer-events disabled.
 */
interface IHeatmapData {
  views_count:  number;
  clicks_count: number;
}

interface ISectionHeatmapOverlayProps {
  svgPath:   string;
  fillRule:  'nonzero' | 'evenodd';
  analytics: IHeatmapData;
  maxScore:  number; // pre-computed maximum across all sections
}

export function SectionHeatmapOverlay({
  svgPath,
  fillRule,
  analytics,
  maxScore,
}: ISectionHeatmapOverlayProps) {
  // Combine views + weighted clicks for a single score
  const score     = analytics.views_count + analytics.clicks_count * 3;
  const intensity = maxScore > 0 ? Math.min(score / maxScore, 1) : 0;

  if (intensity < 0.01) return null;

  // Cold (blue) → Warm (red) via HSL: hue 220→0, as intensity 0→1
  const hue        = Math.round(220 - intensity * 220);
  const saturation = 80;
  const lightness  = 55;
  const alpha      = Math.round(intensity * 0.45 * 100) / 100;

  return (
    <path
      d={svgPath}
      fillRule={fillRule}
      fill={`hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`}
      className="pointer-events-none"
    />
  );
}
