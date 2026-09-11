import type { Dialect } from '../../model/Dialect';

export type PreservedSource = {
  dialect: Dialect;
  value: string;
  reason: string;
};
