import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AlbumComponent.css';

const API_URL = import.meta.env.VITE_API_URL;

const AlbumComponent = () => {
    const [albums, setAlbums] = useState([]);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAlbums();
    }, []);

    const fetchAlbums = async () => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        try {
            const response = await axios.get(`${API_URL}/api/albums/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (Array.isArray(response.data)) {
                setAlbums(response.data);
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (error) {
            setError('Error fetching albums');
            console.error('Error fetching albums:', error.response ? error.response.data : error.message);
        }
    };

    const createAlbum = async () => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        try {
            const response = await axios.post(`${API_URL}/api/albums/`, { name: 'nouname' }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            navigate(`/albums/${response.data.id}`);
        } catch (error) {
            setError('Error creating album');
            console.error('Error creating album:', error.response ? error.response.data : error.message);
        }
    };

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

    const openModal = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const groupedAlbums = groupAlbumsByDate();

    return (
        <div className="album-container">
            <div className="create-album">
                <button onClick={createAlbum}>Create Album</button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {Object.keys(groupedAlbums).sort((a, b) => b - a).map(year => (
                <div key={year} className="year-section">
                    <h2 className="year-header">{year}</h2>
                    {Object.keys(groupedAlbums[year]).sort((a, b) => b - a).map(monthIndex => {
                        const month = new Date(0, monthIndex).toLocaleString('default', { month: 'long' });
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
                                                onClick={() => openModal(album.cover_image)}
                                            />
                                        ) : (
                                            <div className="album-cover-image">No cover image</div>
                                        )}
                                    </div>
                                    <div className="album-info-column">
                                        <button className="album-header-button"
                                                onClick={() => window.location.href = `/albums/${album.id}`}>
                                            {album.name}
                                        </button>
                                        <p className="album-author">Author: {album.author_name}</p>
                                    </div>
                                </div>
                            ))
                        ));
                    })}
                </div>
            ))}

            {/* Fullscreen modal for image */}
            {selectedImage && (
                <div className="modal" onClick={closeModal}>
                    <span className="close" onClick={closeModal}>&times;</span>
                    <img className="modal-content" src={selectedImage} alt="Fullscreen Album Cover" />
                </div>
            )}
        </div>
    );
};

export default AlbumComponent;
