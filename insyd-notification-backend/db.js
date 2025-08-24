// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'insyd_notifications.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            userId TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            email TEXT,
            preferences TEXT -- Stored as JSON string
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS notifications (
            notificationId TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            type TEXT NOT NULL,
            content TEXT NOT NULL,
            status TEXT NOT NULL, -- e.g., 'unread', 'read'
            timestamp INTEGER NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(userId)
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS events (
            eventId TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            sourceUserId TEXT NOT NULL,
            targetUserId TEXT,
            data TEXT, -- Stored as JSON string
            timestamp INTEGER NOT NULL
        )`);
        console.log('Tables created or already exist.');
    }
});

module.exports = db;
