"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteNotification = void 0;
class DeleteNotification {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id) {
        await this.repository.deleteNotification(id);
    }
}
exports.DeleteNotification = DeleteNotification;
