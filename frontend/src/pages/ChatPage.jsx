// ChatPage.jsx
import React, { useState, useEffect } from 'react';
import Chat from '../components/Chat';
import '../styles/ChatPage.css';

const ChatPage = () => {
    const [showOnlineUsers, setShowOnlineUsers] = useState(false);
    const username = localStorage.getItem('username');

    const toggleOnlineUsers = () => {
        setShowOnlineUsers(prevState => !prevState);
    };

    useEffect(() => {
        console.log('Retrieved username:', username);
    }, [username]);

    return (
        <div className="chat-page-wrapper">
            <div className="chat-page-header">
                <h1>
                    Chat Room
                    <button className="toggle-online-users-btn" onClick={toggleOnlineUsers}>
                        {showOnlineUsers ? 'Hide Online Users' : 'Show Online Users'}
                    </button>
                </h1>
                {showOnlineUsers && (
                    <div className="chat-online-users">
                        <h2>Online Users</h2>

                    </div>
                )}
            </div>

            <div className="chat-page-body">
                {username ? <Chat roomName="general" username={username} showOnlineUsers={showOnlineUsers} /> : <p>Loading...</p>}
            </div>
        </div>
    );
};

export default ChatPage;
