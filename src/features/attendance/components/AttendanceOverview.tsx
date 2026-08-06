import { StatCard } from "@/components/ui/StatCard";
import { MOCK_TODAY_ATTENDANCE } from "@/config/demo-data";

function computeTotals() {
  return MOCK_TODAY_ATTENDANCE.reduce(
    (acc, row) => {
      acc.total += row.totalStudents;
      acc.present += row.present;
      acc.absent += row.absent;
      acc.leave += row.leave;
      return acc;
    },
    { total: 0, present: 0, absent: 0, leave: 0 },
  );
}

export function AttendanceOverview() {
  const totals = computeTotals();
  const pct = totals.total ? Math.round((totals.present / totals.total) * 100) : 0;

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-heading">
            Today&apos;s attendance
          </h1>
          <p className="text-sm text-muted mt-1">
            Roll call across all classes, updated as teachers mark it.
          </p>
        </div>

        <div
          className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[3px] border-success text-success select-none"
          role="img"
          aria-label={`${pct} percent present today`}
        >
          <div className="text-center leading-none">
            <div className="font-display text-2xl font-semibold">{pct}%</div>
            <div className="font-sans text-[9px] uppercase tracking-widest mt-1">
              Present
            </div>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
        <StatCard label="Total students" value={totals.total} />
        <StatCard label="Present" value={totals.present} tone="success" />
        <StatCard label="Absent" value={totals.absent} tone="danger" />
        <StatCard label="On leave" value={totals.leave} tone="warning" />
      </dl>

      <div className="rounded-card border border-border bg-surface overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-section text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">Sec.</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 font-medium text-right">Present</th>
              <th className="px-4 py-3 font-medium text-right">Absent</th>
              <th className="px-4 py-3 font-medium text-right">Leave</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TODAY_ATTENDANCE.map((row) => (
              <tr
                key={`${row.classLevel}-${row.section}`}
                className="border-b border-border last:border-b-0 hover:bg-section/60"
              >
                <td className="px-4 py-3 font-medium text-heading">
                  {row.className}
                </td>
                <td className="px-4 py-3 text-muted">{row.section}</td>
                <td className="px-4 py-3 text-right">{row.totalStudents}</td>
                <td className="px-4 py-3 text-right text-success font-medium">
                  {row.present}
                </td>
                <td className="px-4 py-3 text-right text-danger font-medium">
                  {row.absent}
                </td>
                <td className="px-4 py-3 text-right text-warning font-medium">
                  {row.leave}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted">
        Showing mock data — connects to live records once the Attendance
        module (Step 7) is wired to the backend.
      </p>
    </div>
  );
}
