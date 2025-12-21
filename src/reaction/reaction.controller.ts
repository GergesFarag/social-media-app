import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { CurrentUser } from 'src/_core/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwtPayload';
import { AuthGuard } from 'src/_core/guards/auth.guard';

@Controller('reaction')
@UseGuards(AuthGuard)
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Post()
  create(
    @Body() createReactionDto: CreateReactionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.reactionService.addReaction(createReactionDto, user);
  }

  @Get()
  find() {
    return this.reactionService.findAll();
  }
}
