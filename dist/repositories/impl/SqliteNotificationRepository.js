"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteNotificationRepository = void 0;
const SQLite = __importStar(require("expo-sqlite"));
const tsyringe_1 = require("tsyringe");
// Helper function to convert database row to NotificationItem
const mapRowToNotification = (row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    payload: row.payload,
    receivedAt: row.receivedAt,
    isRead: row.isRead === 1
});
let SqliteNotificationRepository = class SqliteNotificationRepository {
    db;
    isInitialized = false;
    constructor() {
        this.db = SQLite.openDatabase('notifications.db');
        this.initializeDatabase().catch(console.error);
    }
    async initializeDatabase() {
        if (this.isInitialized)
            return;
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql(`CREATE TABLE IF NOT EXISTS notifications (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            title TEXT NOT NULL,
                            body TEXT NOT NULL,
                            payload TEXT,
                            receivedAt TEXT NOT NULL,
                            isRead INTEGER DEFAULT 0
                        )`, [], () => {
                    this.isInitialized = true;
                    resolve();
                }, (_, error) => {
                    console.error('Error creating table:', error);
                    reject(error);
                    return false;
                });
            }, error => {
                console.error('Transaction error:', error);
                reject(error);
            });
        });
    }
    async executeQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql(sql, params, (_, { rows: { _array } }) => resolve(_array), (_, error) => {
                    console.error('SQL error:', error);
                    reject(error);
                    return false;
                });
            }, error => {
                console.error('Transaction error:', error);
                reject(error);
            });
        });
    }
    async executeWrite(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql(sql, params, (_, result) => {
                    resolve({
                        insertId: result.insertId,
                        rowsAffected: result.rowsAffected
                    });
                }, (_, error) => {
                    console.error('SQL error:', error);
                    reject(error);
                    return false;
                });
            }, error => {
                console.error('Transaction error:', error);
                reject(error);
            });
        });
    }
    async addNotification(notification) {
        const result = await this.executeWrite('INSERT INTO notifications (title, body, payload, receivedAt, isRead) VALUES (?, ?, ?, ?, ?)', [
            notification.title,
            notification.body,
            notification.payload || null,
            notification.receivedAt,
            notification.isRead ? 1 : 0
        ]);
        if (result.insertId === undefined) {
            throw new Error('Failed to insert notification: No insertId returned');
        }
        return {
            ...notification,
            id: result.insertId
        };
    }
    async getAllNotifications(limit = 50, offset = 0) {
        const rows = await this.executeQuery('SELECT * FROM notifications ORDER BY receivedAt DESC LIMIT ? OFFSET ?', [limit, offset]);
        return rows.map(mapRowToNotification);
    }
    async markNotificationAsRead(id) {
        if (!this.isInitialized) {
            await this.initializeDatabase();
        }
        try {
            await this.executeWrite('UPDATE notifications SET isRead = 1 WHERE id = ?', [id]);
            console.log(`Marked notification ${id} as read`);
        }
        catch (error) {
            console.error(`Failed to mark notification ${id} as read:`, error);
            throw error;
        }
    }
    async deleteNotification(id) {
        if (!this.isInitialized) {
            await this.initializeDatabase();
        }
        try {
            await this.executeWrite('DELETE FROM notifications WHERE id = ?', [id]);
            console.log(`Deleted notification ${id}`);
        }
        catch (error) {
            console.error(`Failed to delete notification ${id}:`, error);
            throw error;
        }
    }
    async markAllNotificationsAsRead() {
        if (!this.isInitialized) {
            await this.initializeDatabase();
        }
        try {
            await this.executeWrite('UPDATE notifications SET isRead = 1 WHERE isRead = 0');
            console.log('Marked all notifications as read');
        }
        catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            throw error;
        }
    }
};
exports.SqliteNotificationRepository = SqliteNotificationRepository;
exports.SqliteNotificationRepository = SqliteNotificationRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], SqliteNotificationRepository);
