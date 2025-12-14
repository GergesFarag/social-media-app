import { Controller, Post, Body } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { CreateReactionDto } from './dto/create-reaction.dto';

@Controller('reaction')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Post()
  create(@Body() createReactionDto: CreateReactionDto) {
    return this.reactionService.addReaction(createReactionDto);
  }
}
