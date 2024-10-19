import React, { useState, useEffect, useRef } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { Link } from 'react-router-dom';
import '../styles/ChatPage.css';

const WebSocket_URL = import.meta.env.VITE_WebSocket_URL;
const Chat = ({ roomName, username, showOnlineUsers }) => {
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const socketRef = useRef(null);

    useEffect(() => {
        socketRef.current = new ReconnectingWebSocket(`${WebSocket_URL}/ws/pubchat/${roomName}/?username=${username}`);

        socketRef.current.onmessage = (e) => {
            const data = JSON.parse(e.data);

            if (data.type === 'user_joined') {
                setOnlineUsers(data.online_users);
            } else if (data.type === 'user_left') {
                setOnlineUsers((prevUsers) => prevUsers.filter(user => user !== data.username));
            } else {
                setMessages((prevMessages) => [...prevMessages, data]);
            }
        };

        return () => {
            socketRef.current.close();
        };
    }, [roomName, username]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (inputMessage) {
            socketRef.current.send(JSON.stringify({
                message: inputMessage,
                sender: username
            }));
            setInputMessage('');
        }
    };

    return (
        <div className="chat-wrapper">
            {showOnlineUsers && (
                <div className="chat-online-users">
                    <h2>Online Users</h2>
                    <ul>
                        {onlineUsers.map((user, index) => (
                            <li key={index}>
                                <Link className="chat-sender-link" to={`/users/${user}/albums`}>
                                    {user}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="chat-messages-container">
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>
                            <Link className="chat-sender-link" to={`/users/${msg.sender}/albums`}>
                                {msg.sender}
                            </Link>
                        </strong>
                        : {msg.message}
                    </div>
                ))}
            </div>
            <form className="chat-message-form" onSubmit={sendMessage}>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default Chat;
