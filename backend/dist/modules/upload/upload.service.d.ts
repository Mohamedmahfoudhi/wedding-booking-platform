import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private readonly configService;
    private readonly useLocalStorage;
    private readonly localUploadDir;
    private readonly publicBaseUrl;
    constructor(configService: ConfigService);
    uploadImage(file: Express.Multer.File, folder?: string): Promise<{
        url: string;
        publicId: string;
    }>;
    uploadImages(files: Express.Multer.File[], folder?: string): Promise<{
        url: string;
        publicId: string;
    }[]>;
    deleteImage(publicId: string): Promise<void>;
    deleteImages(publicIds: string[]): Promise<void>;
    getSignedUploadParams(folder?: string): {
        timestamp: number;
        signature: string;
        cloudName: string;
        apiKey: string;
        folder: string;
    };
    private saveToLocalDisk;
    private uploadToCloudinary;
}
