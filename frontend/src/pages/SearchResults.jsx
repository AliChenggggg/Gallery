import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/AlbumComponent.css';

const API_URL = import.meta.env.VITE_API_URL;

const SearchResults = () => {
    const [albums, setAlbums] = useState([]);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const query = new URLSearchParams(useLocation().search).get('q');

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (query) {
                try {
                    const response = await axios.get(`${API_URL}/api/search/?q=${query}`);
                    if (Array.isArray(response.data)) {
                        setAlbums(response.data);
                    } else {
                        throw new Error('Unexpected response format');
                    }
                } catch (error) {
                    setError('Error fetching search results');
                    console.error('Error fetching search results:', error.response ? error.response.data : error.message);
                }
            }
        };

        fetchSearchResults();
    }, [query]);

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    return (
        <div className="album-container">
            <h2>Search Results for "{query}"</h2>
            {error && <div className="error-message">{error}</div>}
            {albums.length > 0 ? (
                albums.map(album => {
                    const date = new Date(album.created_at);
                    const formattedDate = date.toLocaleDateString();

                    return (
                        <div key={album.id} className="album-item">
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
                                <p className="album-author">
                                    Author: <Link to={`/users/${album.author_name}/albums`}>{album.author_name}</Link>
                                </p>
                                <p className="album-date">{formattedDate}</p>
                            </div>
                        </div>
                    );
                })
            ) : (
                <p>No results found.</p>
            )}

            {selectedImage && (
                <div className="modal" onClick={closeModal}>
                    <span className="close">&times;</span>
                    <img className="modal-content" src={selectedImage} alt="Full Screen" />
                </div>
            )}
        </div>
    );
};

export default SearchResults;
