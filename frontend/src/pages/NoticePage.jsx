import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatPage from '../pages/MessagePage.jsx';
import '../styles/NoticePage.css';

const API_URL = import.meta.env.VITE_API_URL;

const NoticePage = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const token = localStorage.getItem('ACCESS_TOKEN');
            const response = await axios.get(`${API_URL}/api/chat/all_chats/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setChats(response.data);
            if (state && state.username) {
                setSelectedChat(state.username);
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChatClick = (username) => {
        setSelectedChat(username);
    };

    const handleShowDelete = (e, username) => {
        e.stopPropagation(); // Prevent triggering the h3 click
        const deleteBtn = document.getElementById(`delete-${username}`);
        if (deleteBtn) {
            deleteBtn.style.display = deleteBtn.style.display === 'block' ? 'none' : 'block';
        }
    };

    const handleDeleteChat = async (username) => {
        if (window.confirm(`Are you sure you want to delete the chat with ${username}?`)) {
            try {
                const token = localStorage.getItem('ACCESS_TOKEN');
                await axios.delete(`${API_URL}/api/chat/delete_chat/${username}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                await fetchChats();
                if (selectedChat === username) {
                    setSelectedChat(null);
                }
            } catch (error) {
                console.error('Error deleting chat:', error);
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            }
        }
    };
    const truncateText = (text, maxLength) => {
        if (text.length > maxLength) {
            return text.slice(0, maxLength) + '...';
        }
        return text;
    };

    return (
        <div className="chat-container">
            <div className="chat-list">
                <h2>All Chats</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : chats.length > 0 ? (
                    chats.map((chat) => (
                        <div
                            key={chat.username}
                            className={`chat-item ${selectedChat === chat.username ? 'active' : ''}`}
                        >
                            <h3 onClick={() => handleChatClick(chat.username)}>
                                {chat.username}
                                <button className="show-delete-btn" onClick={(e) => handleShowDelete(e, chat.username)}>
                                    ⋮
                                </button>
                            </h3>
                            <p onClick={() => handleChatClick(chat.username)}>
                                {truncateText(chat.latest_message, 10)}
                            </p>
                            <button className="delete-btn" id={`delete-${chat.username}`}
                                    onClick={() => handleDeleteChat(chat.username)}>
                                Delete
                            </button>
                        </div>

                    ))
                ) : (
                    <p>No chats found.</p>
                )}
            </div>
            <div className="chat-content">
                {selectedChat ? (
                    <ChatPage username={selectedChat}/>
                ) : (
                    <div className="chat-header">
                        <h2>Select a chat to start messaging</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoticePage;
