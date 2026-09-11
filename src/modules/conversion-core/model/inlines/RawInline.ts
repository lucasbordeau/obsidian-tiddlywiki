import type { Dialect } from '../Dialect';

export type RawInline = {
  type: 'raw';
  value: string;
  dialect: Dialect;
  reason: string;
};
