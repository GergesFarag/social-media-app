import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CloudService } from './cloud.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { TransformResponse } from 'src/_core/decorators/transform-response.decorator';
import { UploadResponseDto } from './dto/upload-response.dto';
import { AuthGuard } from 'src/_core/guards/auth.guard';

@Controller('cloud')
@UseGuards(AuthGuard)
export class CloudController {
  constructor(private readonly cloudService: CloudService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @TransformResponse(UploadResponseDto)
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.cloudService.uploadFile(file);
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files'))
  @TransformResponse(UploadResponseDto)
  uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    return this.cloudService.uploadMultipleFiles(files);
  }
}
