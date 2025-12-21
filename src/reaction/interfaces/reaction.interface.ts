import { ReactionType } from '../types/reaction.type';
import { Types } from 'mongoose';

export interface IReaction {
  type: ReactionType;
  user: Types.ObjectId;
  post: Types.ObjectId;
}
