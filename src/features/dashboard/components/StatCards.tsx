import { StatCard } from "@/components/ui/StatCard";
import { DASHBOARD_STATS } from "@/config/demo-data";

export function StatCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {DASHBOARD_STATS.map((stat) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          delta={stat.delta}
          tone={stat.tone}
        />
      ))}
    </div>
  );
}
