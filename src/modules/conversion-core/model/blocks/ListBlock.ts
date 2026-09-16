import { ListItem } from '@/modules/conversion-core/model/ListItem';

export type ListBlock = {
  type: 'list';
  ordered: boolean;
  start: number;
  children: ListItem[];
};
