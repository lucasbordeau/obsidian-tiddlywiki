export function isObsidianWebEmbed(target: string): boolean {
  let url: URL;
  try {
    url = new URL(target);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return false;
  }
  const host = url.hostname
    .toLowerCase()
    .replace(/^(?:www\.|m\.|mobile\.)/, '');
  const youtubeVideo =
    host === 'youtube.com' &&
    url.pathname === '/watch' &&
    url.searchParams.has('v');
  const shortYoutubeVideo =
    host === 'youtu.be' && /^\/[^/]+\/?$/.test(url.pathname);
  const tweet =
    (host === 'twitter.com' || host === 'x.com') &&
    /^\/[^/]+\/status\/\d+(?:\/|$)/.test(url.pathname);
  return youtubeVideo || shortYoutubeVideo || tweet;
}
