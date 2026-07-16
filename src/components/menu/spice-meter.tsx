"use client";

import type { SpiceLevel } from "@/lib/menu";
import { SPICE_LEVELS as LEVELS, spiceLabel } from "@/lib/spice";

/** Interactive heat meter: a horizontal bar that fills to the chosen level. */
export function SpiceMeter({
  value,
  onChange,
}: {
  value: SpiceLevel;
  onChange: (level: SpiceLevel) => void;
}) {
  const pct = LEVELS.find((l) => l.key === value)?.pct ?? 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-cocoa">Spice level</span>
        <span className="text-sm font-medium text-pepper">
          {spiceLabel(value)} 🌶️
        </span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-cream-deep">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold via-palm to-pepper transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {LEVELS.map((level) => {
          const selected = level.key === value;
          return (
            <button
              key={level.key}
              type="button"
              onClick={() => onChange(level.key)}
              aria-pressed={selected}
              className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                selected
                  ? "border-pepper bg-pepper text-cream"
                  : "border-cream-deep bg-white text-cocoa/70 hover:border-palm"
              }`}
            >
              {level.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
