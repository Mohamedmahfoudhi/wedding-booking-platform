import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a single image' })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    const result = await this.uploadService.uploadImage(file, folder);
    return {
      message: 'Image uploaded successfully',
      ...result,
    };
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload multiple images' })
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ) {
    const results = await this.uploadService.uploadImages(files, folder);
    return {
      message: 'Images uploaded successfully',
      images: results,
    };
  }

  @Delete(':publicId')
  @ApiOperation({ summary: 'Delete an image' })
  async deleteImage(@Param('publicId') publicId: string) {
    await this.uploadService.deleteImage(publicId);
    return { message: 'Image deleted successfully' };
  }

  @Get('signature')
  @ApiOperation({ summary: 'Get signed upload parameters for direct upload' })
  async getSignature(@Query('folder') folder?: string) {
    const params = this.uploadService.getSignedUploadParams(folder);
    return params;
  }
}
