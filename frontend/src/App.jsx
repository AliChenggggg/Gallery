// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Upload from './pages/Upload';
import Register from './pages/Register';
import AlbumComponent from './pages/AlbumComponent';
import SearchResults from './pages/SearchResults.jsx'
import UserAlbums from './components/UserAlbums';
import ChatPage from './pages/ChatPage';
import NoticePage from './pages/NoticePage';
import AlbumEditPage from './pages/AlbumEditPage';
import AlbumDetailPage from './pages/AlbumDetailPage';
import MessagePage from './pages/MessagePage.jsx';
import NoticePagetem from './pages/NoticePagetem.jsx';
import Home from './pages/Home.jsx';


const App = () => {
    return (
        <Router>
            <div>
                <Navbar />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/albums" element={<AlbumComponent />} />
                    <Route path="/albums/:id" element={<AlbumEditPage />} />
                    <Route path="/notice" element={<NoticePage />} />
                    <Route path="/chatting" element={<NoticePagetem />} />
                    <Route path="/chat/:username" element={<MessagePage />} />
                    <Route path="/pubchat/:roomname" element={<ChatPage />} />
                    <Route path="/users/:username/albums" element={<UserAlbums />} />
                    <Route path="/searchresult/albums/:id" element={<AlbumDetailPage />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
