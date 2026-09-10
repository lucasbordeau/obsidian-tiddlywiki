import type { Dialect } from '../../../source/Dialect';

export type RawBlock = {
  type: 'raw';
  value: string;
  dialect: Dialect;
  reason: string;
};
