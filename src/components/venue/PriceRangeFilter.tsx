'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';

interface IPriceRangeFilterProps {
  globalMin: number;
  globalMax: number;
  range: [number, number];
  onRangeChange: (range: [number, number]) => void;
}

export function PriceRangeFilter({
  globalMin,
  globalMax,
  range,
  onRangeChange,
}: IPriceRangeFilterProps) {
  if (globalMin >= globalMax) return null;

  const step = Math.max(1, Math.round((globalMax - globalMin) / 40));

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Filtre prix
        </span>
        <span className="text-xs font-medium text-gray-500">
          {Math.round(range[0])}€ &ndash; {Math.round(range[1])}€
        </span>
      </div>

      <SliderPrimitive.Root
        className="relative flex h-5 w-full touch-none select-none items-center"
        value={range}
        onValueChange={(vals) => onRangeChange([vals[0], vals[1]] as [number, number])}
        min={globalMin}
        max={globalMax}
        step={step}
        minStepsBetweenThumbs={1}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow rounded-full bg-gray-200">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-blue-500" />
        </SliderPrimitive.Track>

        {/* Min thumb */}
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-blue-500 bg-white shadow-[0_1px_6px_rgba(0,0,0,0.15)] transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" />
        {/* Max thumb */}
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-blue-500 bg-white shadow-[0_1px_6px_rgba(0,0,0,0.15)] transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" />
      </SliderPrimitive.Root>

      <div className="mt-1.5 flex justify-between text-[10px] text-gray-400">
        <span>{Math.round(globalMin)}€</span>
        <span>{Math.round(globalMax)}€</span>
      </div>
    </div>
  );
}
