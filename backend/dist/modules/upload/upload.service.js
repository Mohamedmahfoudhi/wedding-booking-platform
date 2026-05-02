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
let UploadService = class UploadService {
    constructor(configService) {
        this.configService = configService;
        cloudinary_1.v2.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }
    async uploadImage(file, folder = 'wedding-platform') {
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
    async uploadImages(files, folder = 'wedding-platform') {
        return Promise.all(files.map((file) => this.uploadImage(file, folder)));
    }
    async deleteImage(publicId) {
        await cloudinary_1.v2.uploader.destroy(publicId);
    }
    async deleteImages(publicIds) {
        await Promise.all(publicIds.map((id) => this.deleteImage(id)));
    }
    getSignedUploadParams(folder = 'wedding-platform') {
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
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map