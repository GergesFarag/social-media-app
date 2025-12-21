import { Types } from 'mongoose';

export interface IComment {
  post: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  parentComment: Types.ObjectId | null;
  rootComment: Types.ObjectId | null;
  levels: number;
  repliesCount: number;
  likesCount: number;
  isDeleted: boolean;
  deletedReason?: string;
  isEdited: boolean;
}
