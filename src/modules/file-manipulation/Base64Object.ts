import { Temporal } from '@js-temporal/polyfill';

export type Base64Object = {
  base64: string;
  extension: string;
  mimeType: string;
  fileName: string;
  creationDate: Temporal.Instant;
  lastModifiedDate: Temporal.Instant;
};
