import { Dialect } from '@/modules/conversion-core/model/Dialect';

export type RawBlock = {
  type: 'raw';
  value: string;
  dialect: Dialect;
  reason: string;
};
