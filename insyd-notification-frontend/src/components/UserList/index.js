import React from 'react';
import './index.css';

function UserList({ users, onSelectUser, selectedUserId }) {
    return (
        <ul className="user-list">
            {users.map((user) => (
                <li
                    key={user.userId}
                    className={`user-item ${user.userId === selectedUserId ? 'selected' : ''}`}
                    onClick={() => onSelectUser(user.userId)}
                >
                    {user.username} ({user.userId})
                </li>
            ))}
        </ul>
    );
}

export default UserList;
