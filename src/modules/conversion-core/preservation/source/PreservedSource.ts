import { Dialect } from '@/modules/conversion-core/model/Dialect';

export type PreservedSource = {
  dialect: Dialect;
  value: string;
  reason: string;
};
