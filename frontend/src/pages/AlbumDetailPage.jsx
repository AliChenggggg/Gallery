import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/AlbumDetailPage.css';

const API_URL = import.meta.env.VITE_API_URL;

const AlbumDetailPage = () => {
    const { id } = useParams();
    const [album, setAlbum] = useState(null);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchAlbumDetails = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/searchresult/albums/${id}/`);
                setAlbum(response.data);
            } catch (error) {
                setError('Error fetching album details');
                console.error('Error fetching album details:', error.response ? error.response.data : error.message);
            }
        };

        fetchAlbumDetails();
    }, [id]);

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!album) {
        return <div>Loading...</div>;
    }

    const date = new Date(album.created_at);
    const formattedDate = date.toLocaleDateString();

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    return (
        <div className="view-album-detail-container">
            <h2>{album.name}</h2>
            <p className="view-album-author">Author: {album.author_name}</p>
            <p className="view-album-date">{formattedDate}</p>
            {album.cover_image ? (
                <img src={`${album.cover_image}`} alt="Album Cover" className="view-album-cover-image" />
            ) : (
                <div className="view-album-cover-image">No cover image</div>
            )}

            <div className="view-album-images">
                {album.images && album.images.length > 0 ? (
                    album.images.map((image, index) => (
                        <img
                            key={index}
                            src={`${image.image}`}
                            alt={`Album Image ${index + 1}`}
                            className="view-album-image"
                            onClick={() => handleImageClick(image.image)}
                        />
                    ))
                ) : (
                    <p>No images available.</p>
                )}
            </div>

            {selectedImage && (
                <div className="modal" onClick={closeModal}>
                    <span className="close">&times;</span>
                    <img className="modal-content" src={selectedImage} alt="Full Screen" />
                </div>
            )}
        </div>
    );
};

export default AlbumDetailPage;
