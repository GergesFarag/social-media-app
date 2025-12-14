import { UserDocument } from 'src/user/schemas/user.schema';
import { ReactionType } from '../types/reaction.type';
import { PostDocument } from 'src/post/schema/post.schema';

export interface IReaction {
  type: ReactionType;
  user: UserDocument;
  post: PostDocument;
}
