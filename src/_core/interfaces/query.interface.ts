import { SortOrder } from 'mongoose';

export interface IQuery {
  limit: number;
  page: number;
  sort: SortingMapType;
}
export const sortingMap = {
  newest: {
    createdAt: -1 as SortOrder,
  },
  oldest: {
    createdAt: 1 as SortOrder,
  },
  popular: {
    repliesCount: -1 as SortOrder,
    createdAt: -1 as SortOrder,
  },
};

export type SortingMapType = keyof typeof sortingMap;
