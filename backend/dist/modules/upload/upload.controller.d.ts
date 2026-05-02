import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadImage(file: Express.Multer.File, folder?: string): Promise<{
        url: string;
        publicId: string;
        message: string;
    }>;
    uploadImages(files: Express.Multer.File[], folder?: string): Promise<{
        message: string;
        images: {
            url: string;
            publicId: string;
        }[];
    }>;
    deleteImage(publicId: string): Promise<{
        message: string;
    }>;
    getSignature(folder?: string): Promise<{
        timestamp: number;
        signature: string;
        cloudName: string;
        apiKey: string;
        folder: string;
    }>;
}
