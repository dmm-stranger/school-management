import { StatCards } from "@/features/dashboard/components/StatCards";
import { AttendanceTrendChart } from "@/features/dashboard/components/AttendanceTrendChart";
import { RecentActivities } from "@/features/dashboard/components/RecentActivities";
import { UpcomingEvents } from "@/features/dashboard/components/UpcomingEvents";
import { FeeCollectionDonut } from "@/features/dashboard/components/FeeCollectionDonut";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-heading">
          Dashboard
        </h1>
        <p className="text-sm text-muted mt-1">
          Welcome back, John! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      <div className="space-y-6">
        <StatCards />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AttendanceTrendChart />
          </div>
          <RecentActivities />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <UpcomingEvents />
          <FeeCollectionDonut />
        </div>
      </div>
    </div>
  );
}
