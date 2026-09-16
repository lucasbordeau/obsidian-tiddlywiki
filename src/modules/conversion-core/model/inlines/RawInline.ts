import { Dialect } from '@/modules/conversion-core/model/Dialect';

export type RawInline = {
  type: 'raw';
  value: string;
  dialect: Dialect;
  reason: string;
};
