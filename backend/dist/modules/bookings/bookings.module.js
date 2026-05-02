"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bookings_controller_1 = require("./bookings.controller");
const bookings_service_1 = require("./bookings.service");
const booking_entity_1 = require("../../database/entities/booking.entity");
const service_entity_1 = require("../../database/entities/service.entity");
const provider_profile_entity_1 = require("../../database/entities/provider-profile.entity");
const availability_module_1 = require("../availability/availability.module");
const notifications_module_1 = require("../notifications/notifications.module");
const providers_module_1 = require("../providers/providers.module");
let BookingsModule = class BookingsModule {
};
exports.BookingsModule = BookingsModule;
exports.BookingsModule = BookingsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([booking_entity_1.Booking, service_entity_1.Service, provider_profile_entity_1.ProviderProfile]),
            availability_module_1.AvailabilityModule,
            notifications_module_1.NotificationsModule,
            providers_module_1.ProvidersModule,
        ],
        controllers: [bookings_controller_1.BookingsController, bookings_controller_1.ProviderBookingsController],
        providers: [bookings_service_1.BookingsService],
        exports: [bookings_service_1.BookingsService],
    })
], BookingsModule);
//# sourceMappingURL=bookings.module.js.map