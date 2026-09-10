import type { Dialect } from '../../model/source/Dialect';

export type LexingContext = {
  source: string;
  dialect: Dialect;
  cursor: number;
  rest: string;
  isLinePrefix: boolean;
};
