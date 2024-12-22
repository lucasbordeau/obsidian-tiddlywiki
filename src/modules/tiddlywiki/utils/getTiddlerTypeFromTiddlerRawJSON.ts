export const getTiddlerTypeFromTiddlerRawJSON = (tiddlerRawJSON: any) => {
  const type = (tiddlerRawJSON.type as string) ?? 'text';

  if (type.contains('audio')) {
    return 'audio';
  } else if (type.contains('image')) {
    return 'image';
  } else if (type.contains('video')) {
    return 'video';
  } else {
    return 'text';
  }
};
