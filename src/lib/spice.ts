import type { SpiceLevel } from "@/lib/menu";

// Shared spice metadata usable from both server and client components.
export const SPICE_LEVELS: { key: SpiceLevel; label: string; pct: number }[] = [
  { key: "low", label: "Low", pct: 33 },
  { key: "medium", label: "Medium", pct: 66 },
  { key: "hot", label: "Spicy Hot", pct: 100 },
];

export function spiceLabel(level: SpiceLevel): string {
  return SPICE_LEVELS.find((l) => l.key === level)?.label ?? "";
}
