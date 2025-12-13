import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryResponse } from './types/cloudinary-response';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return new Promise<CloudinaryResponse>((res, rej) => {
      const uploadStream = cloudinary.uploader.upload_stream((err, result) => {
        if (err) return rej(new Error(err.message));
        res(result as CloudinaryResponse);
      });
      //Data that converted to stream and piped to uploadStream to bes sent to cloudinary
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  uploadMultipleFiles(
    files: Express.Multer.File[],
  ): Promise<CloudinaryResponse[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  deleteMedia(publicId: string) {
    return cloudinary.uploader.destroy(publicId);
  }
}
