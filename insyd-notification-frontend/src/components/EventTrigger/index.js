import React, { useState } from 'react';
import './index.css';

function EventTrigger({ onTriggerEvent, currentUserId, allUsers }) {
    const [eventType, setEventType] = useState('like');
    const [targetUser, setTargetUser] = useState('');
    const [postOwnerId, setPostOwnerId] = useState('');
    const [postId, setPostId] = useState('');
    const [commentText, setCommentText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        let eventData = {};

        switch (eventType) {
            case 'like':
                if (!postOwnerId || !postId) {
                    alert('Please provide Post Owner ID and Post ID for a like event.');
                    return;
                }
                eventData = { postId, postOwnerId };
                break;
            case 'comment':
                if (!postOwnerId || !postId || !commentText) {
                    alert('Please provide Post Owner ID, Post ID, and Comment Text for a comment event.');
                    return;
                }
                eventData = { postId, postOwnerId, commentText };
                break;
            case 'follow':
                if (!targetUser) {
                    alert('Please select a Target User for a follow event.');
                    return;
                }
                break;
            case 'new_post':
                // For new_post, targetUser could be a placeholder or null for now
                // In a real system, this would trigger notifications to followers
                break;
            case 'message':
                if (!targetUser) {
                    alert('Please select a Target User for a message event.');
                    return;
                }
                break;
            default:
                break;
        }

        onTriggerEvent(eventType, currentUserId, targetUser, eventData);

        // Reset form fields
        setTargetUser('');
        setPostOwnerId('');
        setPostId('');
        setCommentText('');
    };

    const otherUsers = allUsers.filter(user => user.userId !== currentUserId);

    return (
        <div className="event-trigger-container">
            <form onSubmit={handleSubmit} className="event-form">
                <div className="form-group">
                    <label htmlFor="eventType">Event Type:</label>
                    <select id="eventType" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                        <option value="like">Like</option>
                        <option value="comment">Comment</option>
                        <option value="follow">Follow</option>
                        <option value="new_post">New Post</option>
                        <option value="message">Message</option>
                    </select>
                </div>

                {(eventType === 'follow' || eventType === 'message') && (
                    <div className="form-group">
                        <label htmlFor="targetUser">Target User:</label>
                        <select
                            id="targetUser"
                            value={targetUser}
                            onChange={(e) => setTargetUser(e.target.value)}
                            required
                        >
                            <option value="">Select a user</option>
                            {otherUsers.map(user => (
                                <option key={user.userId} value={user.userId}>
                                    {user.username} ({user.userId})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {(eventType === 'like' || eventType === 'comment') && (
                    <>
                        <div className="form-group">
                            <label htmlFor="postOwnerId">Post Owner ID:</label>
                            <select
                                id="postOwnerId"
                                value={postOwnerId}
                                onChange={(e) => setPostOwnerId(e.target.value)}
                                required
                            >
                                <option value="">Select Post Owner</option>
                                {otherUsers.map(user => (
                                    <option key={user.userId} value={user.userId}>
                                        {user.username} ({user.userId})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="postId">Post ID:</label>
                            <input
                                type="text"
                                id="postId"
                                value={postId}
                                onChange={(e) => setPostId(e.target.value)}
                                placeholder="e.g., post_123"
                                required
                            />
                        </div>
                    </>
                )}

                {eventType === 'comment' && (
                    <div className="form-group">
                        <label htmlFor="commentText">Comment Text:</label>
                        <textarea
                            id="commentText"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Your comment..."
                            rows="3"
                            required
                        ></textarea>
                    </div>
                )}

                <button type="submit" className="trigger-btn">Trigger Event</button>
            </form>
        </div>
    );
}

export default EventTrigger;
