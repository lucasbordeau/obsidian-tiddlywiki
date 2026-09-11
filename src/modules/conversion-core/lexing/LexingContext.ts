import type { Dialect } from '../model/Dialect';

export type LexingContext = {
  source: string;
  dialect: Dialect;
  cursor: number;
  rest: string;
  isLinePrefix: boolean;
};
