/**
 * Shared tone → Tailwind class map. Every place that needs a colored
 * icon circle, dot, or accent (feature cards, stat cards, activity
 * icons, chart legends) should import from here instead of defining
 * its own copy — this was previously duplicated across 4 components.
 */
export type Tone = "primary" | "success" | "purple" | "warning" | "danger" | "info";

export const TONE_BG_TEXT: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  purple: "bg-purple/10 text-purple",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-info/10 text-info",
};

export const TONE_TEXT: Record<Tone, string> = {
  primary: "text-primary",
  success: "text-success",
  purple: "text-purple",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
};

export const TONE_HEX: Record<Tone, string> = {
  primary: "#2563EB",
  success: "#10B981",
  purple: "#8B5CF6",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#0EA5E9",
};
