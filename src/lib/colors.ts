// Semantic color helpers. Hex values mirror the tokens in globals.css (charts need raw values).
import type { Category } from "./skills";

export const PILLAR: Record<Category, { hex: string; text: string; bg: string }> = {
  TECHNICAL: { hex: "#6c9bff", text: "text-tec", bg: "bg-tec" },
  TACTICAL: { hex: "#b197fc", text: "text-tac", bg: "bg-tac" },
  PHYSICAL: { hex: "#2dd4bf", text: "text-phy", bg: "bg-phy" },
  MENTAL: { hex: "#f9a8d4", text: "text-men", bg: "bg-men" },
};

export const OVERALL_HEX = "#ff6a13";

export type ScoreTone = "good" | "warn" | "bad";

// One threshold everywhere: 7+ strong, 5-6.9 developing, under 5 needs work.
export function scoreTone(score: number): ScoreTone {
  return score >= 7 ? "good" : score >= 5 ? "warn" : "bad";
}

export const TONE_TEXT: Record<ScoreTone, string> = { good: "text-good", warn: "text-warn", bad: "text-alert" };
export const TONE_BG: Record<ScoreTone, string> = { good: "bg-good", warn: "bg-warn", bad: "bg-alert" };
export const TONE_LABEL: Record<ScoreTone, string> = { good: "Strong", warn: "Developing", bad: "Needs work" };
