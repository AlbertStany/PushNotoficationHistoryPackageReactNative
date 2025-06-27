"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkAllNotificationsAsRead = void 0;
class MarkAllNotificationsAsRead {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute() {
        await this.repository.markAllNotificationsAsRead();
    }
}
exports.MarkAllNotificationsAsRead = MarkAllNotificationsAsRead;
