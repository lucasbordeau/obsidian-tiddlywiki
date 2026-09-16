export function parseTiddlyWikiTimestampToEpochMilliseconds(
  value: string | undefined,
): number | undefined {
  const match = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{3})$/.exec(
    value ?? '',
  );

  if (!match) {
    return undefined;
  }

  const [, year, month, day, hour, minute, second, millisecond] = match;
  const utcInstant = `${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecond}Z`;
  const timestamp = new Date(utcInstant);

  const isValidUtcInstant =
    Number.isFinite(timestamp.getTime()) &&
    timestamp.toISOString() === utcInstant;

  if (!isValidUtcInstant) {
    return undefined;
  }

  return timestamp.getTime();
}
