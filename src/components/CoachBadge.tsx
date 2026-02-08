import { cn } from "@/lib/utils";

const coachConfig: Record<string, { emoji: string; label: string; colorClass: string }> = {
  iron: { emoji: "🏋️", label: "Iron", colorClass: "bg-iron" },
  yoga: { emoji: "🧘", label: "Yoga", colorClass: "bg-yoga" },
  hiit: { emoji: "⚡", label: "HIIT", colorClass: "bg-hiit" },
  kickboxing: { emoji: "🥊", label: "Kickboxing", colorClass: "bg-kickboxing" },
};

export function CoachBadge({ coach, size = "sm" }: { coach: string; size?: "sm" | "lg" }) {
  const config = coachConfig[coach.toLowerCase()] || { emoji: "🤖", label: coach, colorClass: "bg-primary" };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full text-primary-foreground font-medium",
        config.colorClass,
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-4 py-1.5 text-sm"
      )}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}
