export type DatePreset =
  | "all"
  | "this-month"
  | "last-month"
  | "last-30-days"
  | "this-year"
  | "custom";

export function formatDateIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getDateRangeForPreset(preset: DatePreset): { startDate: string; endDate: string } {
  const now = new Date();
  switch (preset) {
    case "this-month":
      return {
        startDate: formatDateIso(new Date(now.getFullYear(), now.getMonth(), 1)),
        endDate: formatDateIso(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      };
    case "last-month":
      return {
        startDate: formatDateIso(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        endDate: formatDateIso(new Date(now.getFullYear(), now.getMonth(), 0)),
      };
    case "last-30-days":
      return {
        startDate: formatDateIso(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
        endDate: formatDateIso(now),
      };
    case "this-year":
      return {
        startDate: formatDateIso(new Date(now.getFullYear(), 0, 1)),
        endDate: formatDateIso(new Date(now.getFullYear(), 11, 31)),
      };
    case "all":
    case "custom":
    default:
      return { startDate: "", endDate: "" };
  }
}
