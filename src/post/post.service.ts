import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './schema/post.schema';
import { JWTPayload } from 'src/_core/interfaces/jwtPayload.interface';
import { UserService } from 'src/user/user.service';
import { Media } from './interfaces/media.interface';
import { CloudService } from 'src/cloud/cloud.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private readonly userService: UserService,
    private readonly cloudService: CloudService,
  ) {}
  async create(createPostDto: CreatePostDto, currentUser: JWTPayload) {
    const user = await this.userService.getProfile(currentUser);
    if (!user) {
      throw new BadRequestException('Invalid user. Cannot create post.');
    }
    const newPost = await this.postModel.create({
      ...createPostDto,
      author: user,
    });
    return newPost.save();
  }

  async findAll(currentUser: JWTPayload) {
    return await this.postModel
      .find()
      .where('author')
      .equals(new Types.ObjectId(currentUser.id));
  }

  async findOne(id: Types.ObjectId) {
    const post = await this.postModel
      .findById(id)
      .populate('author', '-password -__v');
    if (!post) {
      throw new BadRequestException('Post not found.');
    }
    return post;
  }

  update(id: Types.ObjectId, updatePostDto: UpdatePostDto) {
    return this.postModel.findByIdAndUpdate(id, updatePostDto, {
      new: true,
    });
  }
  async updateMediaUrls(id: Types.ObjectId, mediaUrls: Media[]) {
    const post = await this.postModel.findById(id);
    if (!post) {
      throw new BadRequestException('Post not found.');
    }
    mediaUrls.forEach((media) => {
      post.mediaUrls.push(media);
    });
    return await post.save();
  }

  async remove(id: Types.ObjectId) {
    const deletedPost = await this.postModel.findByIdAndDelete(id);
    if (!deletedPost) {
      throw new BadRequestException('Post not found or already deleted.');
    }
    return deletedPost;
  }

  async removeMediaFromPost(id: Types.ObjectId, publicId: string) {
    const post = await this.postModel.findById(id);
    if (!post) {
      throw new BadRequestException('Post not found.');
    }
    const { result } = await this.cloudService.deleteMedia(publicId);
    console.log('Cloud delete result:', result);
    if (result !== 'ok')
      throw new BadRequestException('Failed to delete media from cloud.');
    if (result === 'not found')
      throw new BadRequestException('Media not found in cloud.');
    post.mediaUrls = post.mediaUrls.filter(
      (media) => media.public_id !== publicId,
    );
    return await post.save();
  }
}
