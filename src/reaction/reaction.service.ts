import { Injectable } from '@nestjs/common';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Reaction } from './schema/reaction.schema';
import { Model } from 'mongoose';
import { PostService } from 'src/post/post.service';

@Injectable()
export class ReactionService {
  constructor(
    @InjectModel(Reaction.name) private reactionModel: Model<Reaction>,
    private readonly postService: PostService,
  ) {}
  async addReaction(createReactionDto: CreateReactionDto) {}
}
