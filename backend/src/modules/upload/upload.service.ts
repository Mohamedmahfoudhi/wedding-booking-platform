import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'wedding-platform',
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            reject(new BadRequestException('Failed to upload image'));
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadImages(
    files: Express.Multer.File[],
    folder = 'wedding-platform',
  ): Promise<{ url: string; publicId: string }[]> {
    return Promise.all(files.map((file) => this.uploadImage(file, folder)));
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  async deleteImages(publicIds: string[]): Promise<void> {
    await Promise.all(publicIds.map((id) => this.deleteImage(id)));
  }

  getSignedUploadParams(folder = 'wedding-platform'): {
    timestamp: number;
    signature: string;
    cloudName: string;
    apiKey: string;
    folder: string;
  } {
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      this.configService.get('CLOUDINARY_API_SECRET') || '',
    );

    return {
      timestamp,
      signature,
      cloudName: this.configService.get('CLOUDINARY_CLOUD_NAME') || '',
      apiKey: this.configService.get('CLOUDINARY_API_KEY') || '',
      folder,
    };
  }
}
