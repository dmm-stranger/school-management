import { MOCK_TODAY_ATTENDANCE } from "../mock-data";

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
          <h1 className="font-display text-3xl italic text-ink">
            Today&apos;s attendance
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Roll call across all classes, updated as teachers mark it.
          </p>
        </div>

        {/* Signature element: the ink-stamp attendance badge */}
        <div
          className="
            relative flex h-24 w-24 shrink-0 items-center justify-center
            rounded-full border-[3px] border-accent-moss text-accent-moss
            rotate-[-6deg] select-none
          "
          role="img"
          aria-label={`${pct} percent present today`}
        >
          <div className="absolute inset-1 rounded-full border border-accent-moss/40" />
          <div className="text-center leading-none">
            <div className="font-display text-2xl font-semibold">{pct}%</div>
            <div className="font-mono text-[9px] uppercase tracking-widest mt-1">
              Present
            </div>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
        <SummaryStat label="Total students" value={totals.total} />
        <SummaryStat label="Present" value={totals.present} tone="moss" />
        <SummaryStat label="Absent" value={totals.absent} tone="brick" />
        <SummaryStat label="On leave" value={totals.leave} tone="mustard" />
      </dl>

      <div className="rounded-lg border border-line bg-chalk-dim/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="ledger-row text-left text-xs uppercase tracking-wide text-ink-soft">
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
                className="ledger-row last:border-b-0 hover:bg-chalk-dim/60"
              >
                <td className="px-4 py-3 font-medium text-ink">
                  {row.className}
                </td>
                <td className="px-4 py-3 font-mono text-ink-soft">
                  {row.section}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {row.totalStudents}
                </td>
                <td className="px-4 py-3 text-right font-mono text-accent-moss">
                  {row.present}
                </td>
                <td className="px-4 py-3 text-right font-mono text-accent-brick">
                  {row.absent}
                </td>
                <td className="px-4 py-3 text-right font-mono text-accent-mustard">
                  {row.leave}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-ink-soft">
        Showing mock data — connects to live records once the Attendance
        module (Step 7) is wired to the backend.
      </p>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "moss" | "brick" | "mustard";
}) {
  const toneClass =
    tone === "moss"
      ? "text-accent-moss"
      : tone === "brick"
        ? "text-accent-brick"
        : tone === "mustard"
          ? "text-accent-mustard"
          : "text-ink";

  return (
    <div className="rounded-lg border border-line bg-chalk px-4 py-3">
      <dt className="text-xs uppercase tracking-wide text-ink-soft">
        {label}
      </dt>
      <dd className={`font-mono text-2xl mt-1 ${toneClass}`}>{value}</dd>
    </div>
  );
}
