import { IsIn, IsMongoId, IsNotEmpty } from 'class-validator';
import { reactions, ReactionType } from '../types/reaction.type';

export class CreateReactionDto {
  @IsNotEmpty()
  @IsIn(reactions)
  readonly type: ReactionType;

  @IsNotEmpty()
  @IsMongoId()
  readonly postId: string;
}
