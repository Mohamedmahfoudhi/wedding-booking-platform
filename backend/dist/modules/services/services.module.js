"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const services_controller_1 = require("./services.controller");
const services_service_1 = require("./services.service");
const service_entity_1 = require("../../database/entities/service.entity");
const service_image_entity_1 = require("../../database/entities/service-image.entity");
const service_package_entity_1 = require("../../database/entities/service-package.entity");
const provider_profile_entity_1 = require("../../database/entities/provider-profile.entity");
const providers_module_1 = require("../providers/providers.module");
let ServicesModule = class ServicesModule {
};
exports.ServicesModule = ServicesModule;
exports.ServicesModule = ServicesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([service_entity_1.Service, service_image_entity_1.ServiceImage, service_package_entity_1.ServicePackage, provider_profile_entity_1.ProviderProfile]),
            providers_module_1.ProvidersModule,
        ],
        controllers: [services_controller_1.ServicesController, services_controller_1.ProviderServicesController],
        providers: [services_service_1.ServicesService],
        exports: [services_service_1.ServicesService],
    })
], ServicesModule);
//# sourceMappingURL=services.module.js.map