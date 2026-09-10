import type { ListItem } from '../../lists/ListItem';

export type ListBlock = {
  type: 'list';
  ordered: boolean;
  start: number;
  children: ListItem[];
};
