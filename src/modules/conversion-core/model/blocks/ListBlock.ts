import type { ListItem } from '../ListItem';

export type ListBlock = {
  type: 'list';
  ordered: boolean;
  start: number;
  children: ListItem[];
};
