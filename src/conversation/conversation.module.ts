import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './schema/conversation.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { DirectStrategy } from './strategies/direct.strategy';
import { GroupStrategy } from './strategies/group.strategy';
import { AuthModule } from 'src/auth/auth.module';
import { Message, MessageSchema } from 'src/message/schema/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: User.name, schema: UserSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    AuthModule,
  ],
  controllers: [ConversationController],
  providers: [ConversationService, DirectStrategy, GroupStrategy],
  exports: [ConversationService],
})
export class ConversationModule {}
