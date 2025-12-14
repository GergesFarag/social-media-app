import { ReactionType } from '../types/reaction.type';

export class CreateReactionDto {
  readonly type: ReactionType;
  readonly postId: string;
}
