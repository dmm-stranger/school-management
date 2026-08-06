import { DonutChart } from "@/components/ui/DonutChart";
import { FEE_COLLECTION } from "@/config/demo-data";
import { TONE_HEX } from "@/lib/utils/tone";

const DATA = [
  { name: "Collected", value: FEE_COLLECTION.collected, color: TONE_HEX.primary },
  { name: "Pending", value: FEE_COLLECTION.pending, color: TONE_HEX.success },
  { name: "Overdue", value: FEE_COLLECTION.overdue, color: TONE_HEX.danger },
];

export function FeeCollectionDonut() {
  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-sm h-full">
      <h3 className="font-display font-semibold text-heading mb-2">
        Fee Collection Overview
      </h3>
      <DonutChart
        data={DATA}
        centerValue={`${FEE_COLLECTION.collectedPct}%`}
        centerLabel="Collected"
        size={160}
        format="currency"
      />
    </div>
  );
}
