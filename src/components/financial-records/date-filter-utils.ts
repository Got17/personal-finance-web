export enum DatePreset {
  All = "all",
  ThisMonth = "this-month",
  LastMonth = "last-month",
  Last30Days = "last-30-days",
  ThisYear = "this-year",
  Custom = "custom",
}

export function formatDateIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getDateRangeForPreset(preset: DatePreset): { startDate: string; endDate: string } {
  const now = new Date();
  switch (preset) {
    case DatePreset.ThisMonth:
      return {
        startDate: formatDateIso(new Date(now.getFullYear(), now.getMonth(), 1)),
        endDate: formatDateIso(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      };
    case DatePreset.LastMonth:
      return {
        startDate: formatDateIso(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        endDate: formatDateIso(new Date(now.getFullYear(), now.getMonth(), 0)),
      };
    case DatePreset.Last30Days:
      return {
        startDate: formatDateIso(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
        endDate: formatDateIso(now),
      };
    case DatePreset.ThisYear:
      return {
        startDate: formatDateIso(new Date(now.getFullYear(), 0, 1)),
        endDate: formatDateIso(new Date(now.getFullYear(), 11, 31)),
      };
    case DatePreset.All:
    case DatePreset.Custom:
    default:
      return { startDate: "", endDate: "" };
  }
}
