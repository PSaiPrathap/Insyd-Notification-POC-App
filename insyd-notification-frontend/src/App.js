import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserList from './components/UserList';
import EventTrigger from './components/EventTrigger';
import NotificationList from './components/NotificationList';
import './App.css'; 

const API_BASE_URL = 'http://localhost:5000';

function App() {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [error, setError] = useState(null);

    // Fetch users on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/users`);
                setUsers(response.data);
                setLoadingUsers(false);
                // Select the first user by default if available
                if (response.data.length > 0) {
                    setSelectedUserId(response.data[0].userId);
                }
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users.');
                setLoadingUsers(false);
            }
        };
        fetchUsers();
    }, []);

    // Fetch notifications for the selected user
    useEffect(() => {
        let intervalId;
        if (selectedUserId) {
            const fetchNotifications = async () => {
                setLoadingNotifications(true);
                try {
                    const response = await axios.get(`${API_BASE_URL}/notifications/${selectedUserId}`);
                    setNotifications(response.data);
                    setError(null);
                } catch (err) {
                    console.error('Error fetching notifications:', err);
                    setError('Failed to load notifications.');
                } finally {
                    setLoadingNotifications(false);
                }
            };

            // Initial fetch
            fetchNotifications();

            // Polling for new notifications every 3 seconds
            intervalId = setInterval(fetchNotifications, 3000);
        }

        // Cleanup interval on component unmount or selectedUserId change
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [selectedUserId]);

    const handleUserSelect = (userId) => {
        setSelectedUserId(userId);
        setNotifications([]); // Clear notifications when user changes
    };

    const handleEventTrigger = async (eventType, sourceUser, targetUser, eventData) => {
        try {
            const payload = {
                type: eventType,
                sourceUserId: sourceUser,
                targetUserId: targetUser,
                data: eventData,
            };
            await axios.post(`${API_BASE_URL}/events`, payload);
            alert(`Event "${eventType}" triggered successfully!`);
            // Notifications will be fetched by the polling mechanism
        } catch (err) {
            console.error('Error triggering event:', err);
            alert('Failed to trigger event. Check console for details.');
        }
    };

    // Function to create a mock user (for initial setup)
    const createMockUser = async () => {
        const newUserId = `user_${Date.now()}`;
        const newUsername = `User ${Date.now().toString().slice(-4)}`;
        try {
            await axios.post(`${API_BASE_URL}/users`, { userId: newUserId, username: newUsername });
            alert(`Mock user "${newUsername}" created!`);
            // Re-fetch users to update the list
            const response = await axios.get(`${API_BASE_URL}/users`);
            setUsers(response.data);
            setSelectedUserId(newUserId); // Select the newly created user
        } catch (err) {
            console.error('Error creating mock user:', err);
            alert('Failed to create mock user.');
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Insyd Notification POC</h1>
            </header>
            <div className="main-content">
                <div className="sidebar">
                    <h2>Users</h2>
                    {loadingUsers ? (
                        <p>Loading users...</p>
                    ) : error ? (
                        <p className="error">{error}</p>
                    ) : (
                        <UserList users={users} onSelectUser={handleUserSelect} selectedUserId={selectedUserId} />
                    )}
                    <button onClick={createMockUser} className="create-user-btn">Create Mock User</button>
                </div>
                <div className="content-area">
                    {selectedUserId ? (
                        <>
                            <h2>Event Trigger (Logged in as: {selectedUserId})</h2>
                            <EventTrigger
                                onTriggerEvent={handleEventTrigger}
                                currentUserId={selectedUserId}
                                allUsers={users}
                            />
                            <h2>Notifications for {selectedUserId}</h2>
                            {loadingNotifications ? (
                                <p>Loading notifications...</p>
                            ) : notifications.length === 0 ? (
                                <p>No notifications for this user.</p>
                            ) : (
                                <NotificationList notifications={notifications} />
                            )}
                        </>
                    ) : (
                        <p>Please select a user from the sidebar or create a new mock user.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
