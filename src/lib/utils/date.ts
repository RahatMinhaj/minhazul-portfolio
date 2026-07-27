export function formatMonthYear(date: Date | null) {
  if (!date) return "Needs confirmation";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDate(date: Date | null) {
  if (!date) return "Needs confirmation";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
