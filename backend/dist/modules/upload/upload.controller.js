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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const upload_service_1 = require("./upload.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let UploadController = class UploadController {
    constructor(uploadService) {
        this.uploadService = uploadService;
    }
    async uploadImage(file, folder) {
        const result = await this.uploadService.uploadImage(file, folder);
        return {
            message: 'Image uploaded successfully',
            ...result,
        };
    }
    async uploadImages(files, folder) {
        const results = await this.uploadService.uploadImages(files, folder);
        return {
            message: 'Images uploaded successfully',
            images: results,
        };
    }
    async deleteImage(publicId) {
        await this.uploadService.deleteImage(publicId);
        return { message: 'Image deleted successfully' };
    }
    async getSignature(folder) {
        const params = this.uploadService.getSignedUploadParams(folder);
        return params;
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a single image' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)('folder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)('images'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload multiple images' }),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Query)('folder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadImages", null);
__decorate([
    (0, common_1.Delete)(':publicId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an image' }),
    __param(0, (0, common_1.Param)('publicId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "deleteImage", null);
__decorate([
    (0, common_1.Get)('signature'),
    (0, swagger_1.ApiOperation)({ summary: 'Get signed upload parameters for direct upload' }),
    __param(0, (0, common_1.Query)('folder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getSignature", null);
exports.UploadController = UploadController = __decorate([
    (0, swagger_1.ApiTags)('upload'),
    (0, common_1.Controller)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [upload_service_1.UploadService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map