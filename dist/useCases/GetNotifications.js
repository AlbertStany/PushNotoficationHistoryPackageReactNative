"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetNotifications = void 0;
class GetNotifications {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(limit = 50, offset = 0) {
        return await this.repository.getAllNotifications(limit, offset);
    }
}
exports.GetNotifications = GetNotifications;
