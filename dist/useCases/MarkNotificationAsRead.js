"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkNotificationAsRead = void 0;
class MarkNotificationAsRead {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id) {
        await this.repository.markNotificationAsRead(id);
    }
}
exports.MarkNotificationAsRead = MarkNotificationAsRead;
