"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddNotification = void 0;
class AddNotification {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(item) {
        return await this.repository.addNotification(item);
    }
}
exports.AddNotification = AddNotification;
