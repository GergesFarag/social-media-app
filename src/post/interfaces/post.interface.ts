import { PrivacyEnum } from 'src/_core/enums/privacy.enum';
import { UserDocument } from 'src/user/schemas/user.schema';
import { Media } from './media.interface';

export interface IPost {
  content: string;
  author: UserDocument;
  mediaUrls?: Media[];
  privacySetting: PrivacyEnum;
}
