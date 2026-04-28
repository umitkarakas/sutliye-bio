const ISTANBUL_TZ = "Europe/Istanbul";

function getIstanbulDateStr(offsetDays = 0): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ISTANBUL_TZ }).format(
    new Date(Date.now() - offsetDays * 86400000)
  );
}

export function isValidDateStr(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s + "T00:00:00").getTime());
}

export type DateFilter = { from: string; to: string };

export function parseFilterDates(params: {
  from?: string | string[];
  to?: string | string[];
  days?: string | string[];
}): DateFilter {
  const from = Array.isArray(params.from) ? params.from[0] : params.from;
  const to = Array.isArray(params.to) ? params.to[0] : params.to;

  if (from && to && isValidDateStr(from) && isValidDateStr(to) && from <= to) {
    return { from, to };
  }

  // Backward compat: ?days=7|30|90
  const daysRaw = Array.isArray(params.days) ? params.days[0] : params.days;
  const days = [7, 30, 90].includes(Number(daysRaw)) ? Number(daysRaw) : 30;
  return {
    from: getIstanbulDateStr(days - 1),
    to: getIstanbulDateStr(0)
  };
}
