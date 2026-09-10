export function formatTiddlyWikiTimestamp(value: string): string {
  if (/^\d{17}$/.test(value)) {
    return value;
  }

  const isCalendarDate = /^\d{4}-\d{2}-\d{2}$/.test(value);

  const isExplicitInstant =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    );

  if (!isCalendarDate && !isExplicitInstant) {
    return value;
  }

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));

  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

  const daysByMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  const hasValidCalendarDate =
    month >= 1 && month <= 12 && day >= 1 && day <= daysByMonth[month - 1];

  const hasValidClock =
    isCalendarDate ||
    (Number(value.slice(11, 13)) < 24 &&
      Number(value.slice(14, 16)) < 60 &&
      Number(value.slice(17, 19)) < 60);

  if (!hasValidCalendarDate || !hasValidClock) {
    return value;
  }

  const source = isCalendarDate ? `${value}T00:00:00.000Z` : value;
  const instant = new Date(source);

  if (!Number.isFinite(instant.getTime())) {
    return value;
  }

  const utc = instant.toISOString();
  const hasCalendarRollover = isCalendarDate && utc.slice(0, 10) !== value;

  if (hasCalendarRollover) {
    return value;
  }

  return utc.replace(/[-:.TZ]/g, '');
}
