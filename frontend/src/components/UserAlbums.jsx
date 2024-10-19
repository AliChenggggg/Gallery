import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/UserAlbum.css';
import '../styles/AlbumComponent.css'; // Import the same CSS for consistent styling

const API_URL = import.meta.env.VITE_API_URL;

const UserAlbums = () => {
    const { username } = useParams();
    const [albums, setAlbums] = useState([]);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserAlbums = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/users/${username}/albums/`);
                if (Array.isArray(response.data)) {
                    setAlbums(response.data);
                } else {
                    throw new Error('Unexpected response format');
                }
            } catch (error) {
                setError('Error fetching user albums');
                console.error('Error fetching user albums:', error.response ? error.response.data : error.message);
            }
        };

        fetchUserAlbums();
    }, [username]);

    const groupAlbumsByDate = () => {
        if (!Array.isArray(albums)) return {};

        // Sort albums by creation date in descending order
        const sortedAlbums = [...albums].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const groupedAlbums = {};
        sortedAlbums.forEach(album => {
            const date = new Date(album.created_at);
            const year = date.getFullYear();
            const month = date.getMonth(); // Use month index (0-11) for sorting
            const day = date.getDate();

            if (!groupedAlbums[year]) groupedAlbums[year] = {};
            if (!groupedAlbums[year][month]) groupedAlbums[year][month] = {};
            if (!groupedAlbums[year][month][day]) groupedAlbums[year][month][day] = [];
            groupedAlbums[year][month][day].push(album);
        });

        return groupedAlbums;
    };

    const groupedAlbums = groupAlbumsByDate();

    const handleSendMessagesClick = (username) => {
        navigate('/chatting', { state: { username } });
    };

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    return (
        <div className="album-container">
            <h2 className="album-heading">{username}'s Albums</h2>
            <button className="send-messages-button" onClick={() => handleSendMessagesClick(username)}>Send Messages</button>
            {error && <div className="error-message">{error}</div>}
            {Object.keys(groupedAlbums).sort((a, b) => b - a).map(year => (
                <div key={year} className="year-section">
                    <h2 className="year-header">{year}</h2>
                    {Object.keys(groupedAlbums[year]).sort((a, b) => b - a).map(monthIndex => {
                        const month = new Date(0, monthIndex).toLocaleString('default', {month: 'long'});
                        return Object.keys(groupedAlbums[year][monthIndex]).sort((a, b) => b - a).map(day => (
                            groupedAlbums[year][monthIndex][day].map(album => (
                                <div key={album.id} className="album-item">
                                    <div className="date-column">
                                        <div className="month-column">
                                            <div className="month">{month}</div>
                                        </div>
                                        <div className="day-column">
                                            <div className="day">{day}</div>
                                        </div>
                                    </div>
                                    <div className="cover-image-column">
                                        {album.cover_image ? (
                                            <img
                                                src={`${album.cover_image}`}
                                                alt="Album Cover"
                                                className="album-cover-image"
                                                onClick={() => handleImageClick(album.cover_image)}
                                            />
                                        ) : (
                                            <div className="album-cover-image">No cover image</div>
                                        )}
                                    </div>
                                    <div className="album-info-column">
                                        <Link to={`/searchresult/albums/${album.id}`} className="album-header-button">
                                            {album.name}
                                        </Link>
                                        <p className="album-author">Author: {album.author_name}</p>
                                    </div>
                                </div>
                            ))
                        ));
                    })}
                </div>
            ))}

            {selectedImage && (
                <div className="modal" onClick={closeModal}>
                    <span className="close">&times;</span>
                    <img className="modal-content" src={selectedImage} alt="Full Screen" />
                </div>
            )}
        </div>
    );
};

export default UserAlbums;
