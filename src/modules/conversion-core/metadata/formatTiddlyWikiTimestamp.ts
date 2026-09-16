import { Temporal } from '@js-temporal/polyfill';

export function formatTiddlyWikiTimestamp(
  value: string,
  assumeUtcForNaiveDateTime = false,
): string {
  if (/^\d{17}$/.test(value)) {
    return value;
  }

  const isCalendarDate = /^\d{4}-\d{2}-\d{2}$/.test(value);

  const isExplicitInstant =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    );

  const isNaiveDateTime =
    assumeUtcForNaiveDateTime &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value);

  const isSupportedDate =
    isCalendarDate || isExplicitInstant || isNaiveDateTime;

  if (!isSupportedDate) {
    return value;
  }

  const hasValidSecond = isCalendarDate || Number(value.slice(17, 19)) < 60;

  if (!hasValidSecond) {
    return value;
  }

  try {
    let instant: Temporal.Instant;

    if (isCalendarDate) {
      const calendarDate = Temporal.PlainDate.from(value);

      instant = calendarDate.toZonedDateTime('UTC').toInstant();
    } else {
      const source = isNaiveDateTime ? `${value}Z` : value;

      instant = Temporal.Instant.from(source);
    }

    const utc = instant.toString({ smallestUnit: 'millisecond' });

    return utc.replace(/[-:.TZ]/g, '');
  } catch {
    return value;
  }
}
