"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
const fs_1 = require("fs");
const path_1 = require("path");
const crypto_1 = require("crypto");
let UploadService = class UploadService {
    constructor(configService) {
        this.configService = configService;
        this.useLocalStorage =
            this.configService.get('NODE_ENV') !== 'production';
        this.localUploadDir = (0, path_1.join)(process.cwd(), 'uploads');
        const port = this.configService.get('PORT') || 3000;
        this.publicBaseUrl =
            this.configService.get('PUBLIC_BASE_URL') || `http://localhost:${port}`;
        if (!this.useLocalStorage) {
            cloudinary_1.v2.config({
                cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
                api_key: this.configService.get('CLOUDINARY_API_KEY'),
                api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
            });
        }
    }
    async uploadImage(file, folder = 'wedding-platform') {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (this.useLocalStorage) {
            return this.saveToLocalDisk(file, folder);
        }
        return this.uploadToCloudinary(file, folder);
    }
    async uploadImages(files, folder = 'wedding-platform') {
        return Promise.all(files.map((file) => this.uploadImage(file, folder)));
    }
    async deleteImage(publicId) {
        if (this.useLocalStorage) {
            const filePath = (0, path_1.join)(this.localUploadDir, publicId);
            await fs_1.promises.unlink(filePath).catch(() => undefined);
            return;
        }
        await cloudinary_1.v2.uploader.destroy(publicId);
    }
    async deleteImages(publicIds) {
        await Promise.all(publicIds.map((id) => this.deleteImage(id)));
    }
    getSignedUploadParams(folder = 'wedding-platform') {
        if (this.useLocalStorage) {
            throw new common_1.BadRequestException('Signed uploads are not available in local storage mode');
        }
        const timestamp = Math.round(Date.now() / 1000);
        const signature = cloudinary_1.v2.utils.api_sign_request({ timestamp, folder }, this.configService.get('CLOUDINARY_API_SECRET') || '');
        return {
            timestamp,
            signature,
            cloudName: this.configService.get('CLOUDINARY_CLOUD_NAME') || '',
            apiKey: this.configService.get('CLOUDINARY_API_KEY') || '',
            folder,
        };
    }
    async saveToLocalDisk(file, folder) {
        const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '_');
        const dir = (0, path_1.join)(this.localUploadDir, safeFolder);
        await fs_1.promises.mkdir(dir, { recursive: true });
        const ext = (0, path_1.extname)(file.originalname) || '.bin';
        const filename = `${(0, crypto_1.randomUUID)()}${ext}`;
        const relPath = `${safeFolder}/${filename}`;
        await fs_1.promises.writeFile((0, path_1.join)(dir, filename), file.buffer);
        return {
            url: `${this.publicBaseUrl}/uploads/${relPath}`,
            publicId: relPath,
        };
    }
    uploadToCloudinary(file, folder) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder,
                resource_type: 'image',
                transformation: [
                    { width: 1200, height: 800, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' },
                ],
            }, (error, result) => {
                if (error) {
                    reject(new common_1.BadRequestException('Failed to upload image'));
                }
                else if (result) {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                    });
                }
            });
            uploadStream.end(file.buffer);
        });
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map