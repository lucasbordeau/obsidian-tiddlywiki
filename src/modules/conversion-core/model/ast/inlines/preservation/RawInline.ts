import type { Dialect } from '../../../source/Dialect';

export type RawInline = {
  type: 'raw';
  value: string;
  dialect: Dialect;
  reason: string;
};
