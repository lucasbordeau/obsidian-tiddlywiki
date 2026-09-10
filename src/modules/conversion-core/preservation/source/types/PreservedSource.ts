import type { Dialect } from '../../../model/source/Dialect';

export type PreservedSource = {
  dialect: Dialect;
  value: string;
  reason: string;
};
