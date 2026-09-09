import { Dialect } from './Dialect';

export type PreservedSource = {
  dialect: Dialect;
  value: string;
  reason: string;
};
