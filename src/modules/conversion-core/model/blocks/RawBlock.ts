import type { Dialect } from '../Dialect';

export type RawBlock = {
  type: 'raw';
  value: string;
  dialect: Dialect;
  reason: string;
};
