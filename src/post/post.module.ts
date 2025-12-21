import { forwardRef, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schema/post.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { AuthModule } from 'src/auth/auth.module';
import { UserService } from 'src/user/user.service';
import { CloudModule } from 'src/cloud/cloud.module';
import { ReactionModule } from 'src/reaction/reaction.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
    CloudModule,
    forwardRef(() => ReactionModule),
  ],
  controllers: [PostController],
  providers: [PostService, UserService],
  exports: [PostService],
})
export class PostModule {}
