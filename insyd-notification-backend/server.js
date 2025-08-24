// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory event queue (for POC simplicity)
const eventQueue = [];

// --- Helper Functions ---
const processEvent = (event) => {
    console.log('Processing event:', event);
    const { type, sourceUserId, targetUserId, data } = event;
    let notificationContent = '';
    let notificationUserId = '';

    switch (type) {
        case 'like':
            const { postId, postOwnerId } = JSON.parse(data);
            notificationContent = `${sourceUserId} liked your post (${postId}).`;
            notificationUserId = postOwnerId;
            break;
        case 'comment':
            const { postId: commentPostId, postOwnerId: commentPostOwnerId, commentText } = JSON.parse(data);
            notificationContent = `${sourceUserId} commented "${commentText}" on your post (${commentPostId}).`;
            notificationUserId = commentPostOwnerId;
            break;
        case 'follow':
            notificationContent = `${sourceUserId} started following you.`;
            notificationUserId = targetUserId;
            break;
        case 'new_post':
            notificationContent = `${sourceUserId} published a new post.`;
            notificationUserId = targetUserId || 'some_default_user_id'; // Placeholder, needs proper logic for followers
            break;
        case 'message':
            notificationContent = `${sourceUserId} sent you a message.`;
            notificationUserId = targetUserId;
            break;
        default:
            console.warn('Unknown event type:', type);
            return;
    }

    if (notificationUserId) {
        const notification = {
            notificationId: uuidv4(),
            userId: notificationUserId,
            type: type,
            content: notificationContent,
            status: 'unread',
            timestamp: Date.now(),
        };

        db.run(
            `INSERT INTO notifications (notificationId, userId, type, content, status, timestamp) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                notification.notificationId,
                notification.userId,
                notification.type,
                notification.content,
                notification.status,
                notification.timestamp,
            ],
            function (err) {
                if (err) {
                    console.error('Error inserting notification:', err.message);
                } else {
                    console.log(`Notification generated for ${notification.userId}: ${notification.content}`);
                }
            }
        );
    }
};

// Simulate event processing loop
setInterval(() => {
    if (eventQueue.length > 0) {
        const event = eventQueue.shift();
        processEvent(event);
    }
}, 1000); // Process events every 1 second

// --- API Endpoints ---

// POST /events: Create an event
app.post('/events', (req, res) => {
    const { type, sourceUserId, targetUserId, data } = req.body;

    if (!type || !sourceUserId) {
        return res.status(400).json({ message: 'Missing required event fields: type, sourceUserId' });
    }

    const event = {
        eventId: uuidv4(),
        type,
        sourceUserId,
        targetUserId: targetUserId || null,
        data: data ? JSON.stringify(data) : null,
        timestamp: Date.now(),
    };

    db.run(
        `INSERT INTO events (eventId, type, sourceUserId, targetUserId, data, timestamp) VALUES (?, ?, ?, ?, ?, ?)`,
        [event.eventId, event.type, event.sourceUserId, event.targetUserId, event.data, event.timestamp],
        function (err) {
            if (err) {
                console.error('Error inserting event:', err.message);
                return res.status(500).json({ message: 'Failed to store event' });
            }
            eventQueue.push(event); // Add event to in-memory queue for processing
            res.status(201).json({ message: 'Event created and queued for processing', eventId: event.eventId });
        }
    );
});

// GET /notifications/:userId: Retrieve notifications for a user
app.get('/notifications/:userId', (req, res) => {
    const { userId } = req.params;
    db.all(
        `SELECT * FROM notifications WHERE userId = ? ORDER BY timestamp DESC`,
        [userId],
        (err, rows) => {
            if (err) {
                console.error('Error retrieving notifications:', err.message);
                return res.status(500).json({ message: 'Failed to retrieve notifications' });
            }
            res.json(rows);
        }
    );
});

// POST /notifications (for testing/manual creation, as per document)
app.post('/notifications', (req, res) => {
    const { userId, type, content } = req.body;
    if (!userId || !type || !content) {
        return res.status(400).json({ message: 'Missing required notification fields: userId, type, content' });
    }

    const notification = {
        notificationId: uuidv4(),
        userId,
        type,
        content,
        status: 'unread',
        timestamp: Date.now(),
    };

    db.run(
        `INSERT INTO notifications (notificationId, userId, type, content, status, timestamp) VALUES (?, ?, ?, ?, ?, ?)`,
        [
            notification.notificationId,
            notification.userId,
            notification.type,
            notification.content,
            notification.status,
            notification.timestamp,
        ],
        function (err) {
            if (err) {
                console.error('Error inserting notification:', err.message);
                return res.status(500).json({ message: 'Failed to create notification' });
            }
            res.status(201).json({ message: 'Notification created successfully', notificationId: notification.notificationId });
        }
    );
});

// POST /users (for creating mock users)
app.post('/users', (req, res) => {
    const { userId, username, email, preferences } = req.body;
    if (!userId || !username) {
        return res.status(400).json({ message: 'Missing required user fields: userId, username' });
    }

    db.run(
        `INSERT INTO users (userId, username, email, preferences) VALUES (?, ?, ?, ?)`,
        [userId, username, email || null, preferences ? JSON.stringify(preferences) : null],
        function (err) {
            if (err) {
                console.error('Error inserting user:', err.message);
                return res.status(500).json({ message: 'Failed to create user' });
            }
            res.status(201).json({ message: 'User created successfully', userId: userId });
        }
    );
});

// GET /users (for displaying users)
app.get('/users', (req, res) => {
    db.all(`SELECT userId, username, email FROM users`, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving users:', err.message);
            return res.status(500).json({ message: 'Failed to retrieve users' });
        }
        res.json(rows);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
