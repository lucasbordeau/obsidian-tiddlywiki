export function parseAndNormalizeTags(tagList: string) {
  // Function to normalize a tag
  function normalizeTag(tag: string) {
    return tag
      .trim()
      .replace(/ /g, '_') // Replace spaces with underscores
      .normalize('NFD') // Decompose special characters into base form
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-zA-Z0-9_]/g, ''); // Remove remaining non-alphanumeric characters
  }

  // Regex to match tags enclosed in [[ ]] and normalize them
  return tagList.replace(/\[\[(.*?)\]\]/g, (match, tag) => normalizeTag(tag));
}
