import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private readonly useLocalStorage: boolean;
  private readonly localUploadDir: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.useLocalStorage =
      this.configService.get('NODE_ENV') !== 'production';
    this.localUploadDir = join(process.cwd(), 'uploads');
    const port = this.configService.get('PORT') || 3000;
    this.publicBaseUrl =
      this.configService.get('PUBLIC_BASE_URL') || `http://localhost:${port}`;

    if (!this.useLocalStorage) {
      cloudinary.config({
        cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
        api_key: this.configService.get('CLOUDINARY_API_KEY'),
        api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
      });
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'wedding-platform',
  ): Promise<{ url: string; publicId: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (this.useLocalStorage) {
      return this.saveToLocalDisk(file, folder);
    }
    return this.uploadToCloudinary(file, folder);
  }

  async uploadImages(
    files: Express.Multer.File[],
    folder = 'wedding-platform',
  ): Promise<{ url: string; publicId: string }[]> {
    return Promise.all(files.map((file) => this.uploadImage(file, folder)));
  }

  async deleteImage(publicId: string): Promise<void> {
    if (this.useLocalStorage) {
      const filePath = join(this.localUploadDir, publicId);
      await fs.unlink(filePath).catch(() => undefined);
      return;
    }
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
    if (this.useLocalStorage) {
      throw new BadRequestException(
        'Signed uploads are not available in local storage mode',
      );
    }
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

  private async saveToLocalDisk(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; publicId: string }> {
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = join(this.localUploadDir, safeFolder);
    await fs.mkdir(dir, { recursive: true });

    const ext = extname(file.originalname) || '.bin';
    const filename = `${randomUUID()}${ext}`;
    const relPath = `${safeFolder}/${filename}`;

    await fs.writeFile(join(dir, filename), file.buffer);

    return {
      url: `${this.publicBaseUrl}/uploads/${relPath}`,
      publicId: relPath,
    };
  }

  private uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
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
}
