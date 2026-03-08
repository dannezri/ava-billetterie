import { useCallback, useRef } from 'react';

type TrackType = 'view' | 'hover' | 'click';

/**
 * Fire-and-forget analytics tracker.
 * Debounces hover events (500ms) and deduplicates views per section per session.
 */
export function useSectionAnalytics(eventId: string) {
  const viewedSections  = useRef<Set<string>>(new Set());
  const hoverTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const track = useCallback(
    (sectionId: string, type: TrackType) => {
      // Skip if no eventId yet
      if (!eventId) return;

      // Deduplicate page views per session
      if (type === 'view') {
        if (viewedSections.current.has(sectionId)) return;
        viewedSections.current.add(sectionId);
      }

      fetch('/api/analytics/section-track', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ event_id: eventId, section_id: sectionId, type }),
      }).catch(() => {
        // silent — analytics must never block UI
      });
    },
    [eventId],
  );

  const trackView = useCallback((sectionId: string) => track(sectionId, 'view'), [track]);

  const trackHover = useCallback(
    (sectionId: string | null) => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (!sectionId) return;
      hoverTimerRef.current = setTimeout(() => track(sectionId, 'hover'), 500);
    },
    [track],
  );

  const trackClick = useCallback((sectionId: string) => track(sectionId, 'click'), [track]);

  return { trackView, trackHover, trackClick };
}
