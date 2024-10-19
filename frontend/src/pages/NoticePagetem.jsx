import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatPage from '../pages/MessagePage.jsx';
import '../styles/NoticePage.css';

const API_URL = import.meta.env.VITE_API_URL;

const NoticePage = () => {
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

    return (
        <div className="chat-content1">
            {loading ? (
                <p>Loading...</p>
            ) : selectedChat ? (
                <ChatPage username={selectedChat}/>
            ) : (
                <div className="chat-header">
                    <h2>Select a chat to start messaging</h2>
                </div>
            )}
        </div>
    );
};

export default NoticePage;
