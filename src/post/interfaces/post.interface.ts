import { PrivacyEnum } from 'src/_core/enums/privacy.enum';
import { UserDocument } from 'src/user/schemas/user.schema';
import { Media } from '../../_core/interfaces/media.interface';
import { ReactionType } from 'src/reaction/types/reaction.type';

export interface IPost {
  content: string;
  author: UserDocument;
  privacySetting: PrivacyEnum;
  reactions: Record<ReactionType, number>;
  mediaUrls?: Media[];
  commentsCount: number;
}
