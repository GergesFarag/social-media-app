import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from 'src/_core/guards/auth.guard';
import { CurrentUser } from 'src/_core/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwtPayload';
import { CommentResponseDto } from './dto/comment-response.dto';
import { TransformResponse } from 'src/_core/decorators/transform-response.decorator';
import { IQuery } from 'src/_core/interfaces/query.interface';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { DeleteCommentDto } from './dto/delete-comment.dto';

@Controller('comments')
@UseGuards(AuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @TransformResponse(CommentResponseDto)
  create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commentService.create(createCommentDto, user);
  }

  @Get('post/:postId')
  getCommentsOnPost(@Param('postId') postId: string, @Query() query: IQuery) {
    return this.commentService.findPostComments(postId, query);
  }

  @Get(':commentId/replies')
  @TransformResponse(CommentResponseDto)
  getRepliesOnComment(
    @Param('commentId') commentId: string,
    @Query() query: IQuery,
  ) {
    return this.commentService.getRepliesOnComment(commentId, query);
  }

  @Patch(':commentId')
  @TransformResponse(CommentResponseDto)
  editComment(
    @Param('commentId') commentId: string,
    @Body() body: UpdateCommentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commentService.update(commentId, body, user);
  }

  @Delete(':commentId')
  remove(
    @Param('commentId') commentId: string,
    @CurrentUser() currentUser: JwtPayload,
    @Body() body?: DeleteCommentDto,
  ) {
    return this.commentService.remove(commentId, currentUser, body);
  }
}
