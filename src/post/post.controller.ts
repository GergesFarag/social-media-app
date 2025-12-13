import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CurrentUser } from 'src/_core/decorators/current-user.decorator';
import { JWTPayload } from 'src/_core/interfaces/jwtPayload.interface';
import { Roles } from 'src/_core/decorators/roles.decorator';
import { RolesEnum } from 'src/_core/enums/roles.enum';
import { AuthGuard } from 'src/_core/guards/auth.guard';
import { RolesGuard } from 'src/_core/guards/roles.guard';
import { Types } from 'mongoose';
import { TransformResponse } from 'src/_core/decorators/transform-response.decorator';
import { PostResponseDto } from './dto/post-response.dto';
import { ParseObjIdPipe } from 'src/_core/pipes/parse-obj-id.pipe';
import { Media } from './interfaces/media.interface';

@Controller('post')
@UseGuards(AuthGuard, RolesGuard)
@Roles(RolesEnum.USER, RolesEnum.ADMIN)
@TransformResponse(PostResponseDto)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() currentUser: JWTPayload,
  ) {
    return this.postService.create(createPostDto, currentUser);
  }

  @Get()
  findAll(@CurrentUser() currentUser: JWTPayload) {
    return this.postService.findAll(currentUser);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjIdPipe) id: Types.ObjectId) {
    return this.postService.findOne(id);
  }

  @Patch(':id/media')
  addMediaToPost(
    @Param('id', ParseObjIdPipe) id: Types.ObjectId,
    @Body('mediaUrls') mediaUrls: Media[],
  ) {
    return this.postService.update(id, { mediaUrls });
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjIdPipe) id: Types.ObjectId,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id/media/:publicId')
  async removeMediaFromPost(
    @Param('id', ParseObjIdPipe) id: Types.ObjectId,
    @Param('publicId') publicId: string,
  ) {
    return this.postService.removeMediaFromPost(id, publicId);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjIdPipe) id: Types.ObjectId) {
    return this.postService.remove(id);
  }
}
