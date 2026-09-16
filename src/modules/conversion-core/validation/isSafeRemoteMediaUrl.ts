export function isSafeRemoteMediaUrl(value: string): boolean {
  const literalHttpUrl = /^https?:\/\/[^\s<>"'`\\]+$/i.test(value);

  if (!literalHttpUrl) {
    return false;
  }

  try {
    const url = new URL(value);
    const hasCredentials = url.username !== '' || url.password !== '';

    return !hasCredentials && url.hostname !== '';
  } catch {
    return false;
  }
}
