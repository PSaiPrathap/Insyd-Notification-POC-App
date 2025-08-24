import React from 'react';
import './index.css';

function NotificationList({ notifications }) {
    return (
        <div className="notification-list-container">
            <ul className="notification-list">
                {notifications.map((notification) => (
                    <li key={notification.notificationId} className={`notification-item ${notification.status}`}>
                        <div className="notification-header">
                            <span className="notification-type">{notification.type.toUpperCase()}</span>
                            <span className="notification-timestamp">
                                {new Date(notification.timestamp).toLocaleString()}
                            </span>
                        </div>
                        <p className="notification-content">{notification.content}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default NotificationList;
