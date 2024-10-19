import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/MessagePage.css';

const API_URL = import.meta.env.VITE_API_URL;

const MessagePage = ({ username }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        const fetchMessages = async () => {
            const token = localStorage.getItem('ACCESS_TOKEN');
            try {
                const response = await axios.get(`${API_URL}/api/chat/${username}/user_messages/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                // Sort messages by timestamp
                const sortedMessages = response.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                setMessages(sortedMessages);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
        const intervalId = setInterval(fetchMessages, 1500);
        return () => clearInterval(intervalId);
    }, [username]);

    const handleSendMessage = async () => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        try {
            const response = await axios.post(`${API_URL}/api/chat/${username}/user_messages/`,
                { message_content: newMessage },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            // Add new message and sort
            const updatedMessages = [...messages, response.data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setMessages(updatedMessages);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="chat-page">
            <div className="chat-header">
                <h2>Chat with {username}</h2>
            </div>
            <div className="chat-messages">
                {messages.map(message => (
                    <div key={message.id} className="message">
                        <span className="message-sender">{message.sender.username}:</span> {message.message_content}
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message"
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default MessagePage;
