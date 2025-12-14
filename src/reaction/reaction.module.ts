import { Module } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { ReactionController } from './reaction.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Reaction, ReactionSchema } from './schema/reaction.schema';
import { AuthModule } from 'src/auth/auth.module';
import { Post, PostSchema } from 'src/post/schema/post.schema';
import { PostModule } from 'src/post/post.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reaction.name, schema: ReactionSchema },
      { name: Post.name, schema: PostSchema },
    ]),
    AuthModule,
    PostModule,
  ],
  controllers: [ReactionController],
  providers: [ReactionService],
})
export class ReactionModule {}
