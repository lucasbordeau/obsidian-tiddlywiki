import { Temporal } from '@js-temporal/polyfill';

export type MediaFile = {
  filePath: string;
  extension: string;
  mimeType: string;
  creationDate: Temporal.Instant;
  lastModifiedDate: Temporal.Instant;
};
