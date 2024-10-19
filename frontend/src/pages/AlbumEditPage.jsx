import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import "../styles/AlbumEditPage.css";

const API_URL = import.meta.env.VITE_API_URL;

const AlbumEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [album, setAlbum] = useState({ images: [] });
    const [error, setError] = useState('');
    const [albumName, setAlbumName] = useState('');
    const [newAlbumName, setNewAlbumName] = useState('');
    const [scrollPosition, setScrollPosition] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const albumRef = useRef(null);
    const thumbRef = useRef(null);

    useEffect(() => {
        fetchAlbum();
    }, []);

    const fetchAlbum = async () => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        try {
            const response = await axios.get(`${API_URL}/api/albums/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const sortedImages = response.data.images.sort((a, b) => a.order - b.order);
            setAlbum({ ...response.data, images: sortedImages });
            setAlbumName(response.data.name);
            setNewAlbumName(response.data.name);
        } catch (error) {
            setError('Error fetching album');
            console.error('Error fetching album:', error.response ? error.response.data : error.message);
        }
    };

    const handleAlbumNameChange = (e) => {
        setNewAlbumName(e.target.value);
    };

    const updateAlbumName = async () => {
        if (newAlbumName === albumName) return;
        const token = localStorage.getItem('ACCESS_TOKEN');
        try {
            await axios.patch(`${API_URL}/api/albums/${id}/`,
                { name: newAlbumName },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setAlbumName(newAlbumName);
            setAlbum(prevAlbum => ({ ...prevAlbum, name: newAlbumName }));
            console.log('Album name updated');
        } catch (error) {
            setError('Error updating album name');
            console.error('Error updating album name:', error.response ? error.response.data : error.message);
        }
    };

    const handleDropImage = (image, position) => {
        const updatedImages = [...album.images];
        const currentIndex = updatedImages.findIndex(img => img.id === image.id);
        if (currentIndex !== -1) {
            updatedImages.splice(currentIndex, 1);
            updatedImages.splice(position, 0, image);
            setAlbum(prevAlbum => ({ ...prevAlbum, images: updatedImages }));
            saveImageOrder(updatedImages.map(img => img.id));
        }
    };

    const saveImageOrder = async (orderedImageIds) => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        try {
            await axios.post(`${API_URL}/api/albums/${id}/update_image_order/`,
                { image_orders: orderedImageIds },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('Image order saved');
        } catch (error) {
            setError('Error saving image order');
            console.error('Error saving image order:', error.response ? error.response.data : error.message);
        }
    };

    const handleUpload = async (newImage) => {
        setAlbum(prevAlbum => ({
            ...prevAlbum,
            images: [...prevAlbum.images, newImage]
        }));

        await axios.post(`${API_URL}/api/albums/${id}/update_cover_image/`, {
            cover_image: newImage.image
        }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('ACCESS_TOKEN')}`,
                'Content-Type': 'application/json'
            }
        });
    };

    const handleDeleteImage = async (imageId) => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        try {
            await axios.delete(`${API_URL}/api/images/${imageId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchAlbum(); // Refresh album data
        } catch (error) {
            setError('Error deleting image');
            console.error('Error deleting image:', error.response ? error.response.data : error.message);
        }
    };

    const deleteAlbum = async () => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        try {
            await axios.delete(`${API_URL}/api/albums/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            navigate('/albums'); // Navigate to the albums list page after deletion
        } catch (error) {
            setError('Error deleting album');
            console.error('Error deleting album:', error.response ? error.response.data : error.message);
        }
    };

    const handleScroll = () => {
        if (albumRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = albumRef.current;
            const scrollPercentage = (scrollLeft / (scrollWidth - clientWidth)) * 100;
            setScrollPosition(scrollPercentage);
        }
    };

    const handleThumbMouseDown = (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const thumbRect = thumbRef.current.getBoundingClientRect();
        const thumbStartLeft = thumbRect.left;
        const scrollBarWidth = thumbRef.current.parentNode.clientWidth;

        const handleMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const newThumbLeft = Math.max(0, Math.min(scrollBarWidth - thumbRect.width, thumbStartLeft + deltaX - thumbRef.current.parentNode.getBoundingClientRect().left));
            const newScrollPercentage = (newThumbLeft / (scrollBarWidth - thumbRect.width)) * 100;
            setScrollPosition(newScrollPercentage);

            if (albumRef.current) {
                const { scrollWidth, clientWidth } = albumRef.current;
                albumRef.current.scrollLeft = ((scrollWidth - clientWidth) * newScrollPercentage) / 100;
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };
    const calculateImagePositions = () => {
        const totalImages = album.images.length;
        return album.images.map((image, index) => {
            const xOffset = (index - scrollPosition) * 60; // 调整堆叠间隔
            const zIndex = totalImages - index;
            const opacity = Math.max(0, 1 - Math.abs(index - scrollPosition) * 0.5);
            const scale = 1 - Math.abs(index - scrollPosition) * 0.1;
            return {
                transform: `translateX(${xOffset}px) scale(${scale})`,
                zIndex,
                opacity
            };
        });
    };

    return (
        <div className="album-edit-container">
            {error && <div className="error-message">{error}</div>}
            {album ? (
                <>
                    <div className="album-name-container">
                        <input
                            type="text"
                            value={newAlbumName}
                            onChange={handleAlbumNameChange}
                            onBlur={updateAlbumName}
                            className="album-name-input"
                        />



                        <button className="delete-album-button" onClick={() => {
                            const confirmDelete = window.confirm('Are you sure you want to delete this album? This action cannot be undone.');
                            if (confirmDelete) {
                                deleteAlbum();
                            }
                        }}>

    			    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        			<path d="M3 6h18v2H3V6zm2 3h14l-1.7 13.3c-.1.7-.7 1.2-1.4 1.2H8.1c-.7 0-1.3-.5-1.4-1.2L5 9zm5-5h4v1H8V4zm1-1h4c.5 0 .9.4.9.9V4H9.1V3.9c0-.5.4-.9.9-.9z"/>
    			    </svg>
			</button>




                    </div>

                    <ImageUpload
                        albumId={album.id}
                        onUpload={handleUpload}
                    />
                    <ProgressBar
                        images={album.images}
                        onDropImage={handleDropImage}
                        onDeleteImage={handleDeleteImage}
                    />


                    <div className="album-container1">
                        <div
                            className="album-images"
                            ref={albumRef}
                            onScroll={handleScroll}
                        >
                            {album.images.map(image => (
                                <div key={image.id} className="album-image-container">
                                    <img
                                        src={`${image.image}`}
                                        alt="Album Image"
                                        className="album-image"
                                        onClick={() => handleImageClick(image.image)}
                                    />
                                </div>
                            ))}
                        </div>


                        <div className="scroll-container">
                            <div
                                ref={thumbRef}
                                className="scroll-thumb"
                                style={{
                                    width: `${albumRef.current ? (albumRef.current.clientWidth / albumRef.current.scrollWidth) * 100 : 0}%`,
                                    left: `${scrollPosition}%`
                                }}
                                onMouseDown={handleThumbMouseDown}
                            ></div>
                        </div>
                    </div>
                    {selectedImage && (
                        <div className="modal" onClick={closeModal}>
                            <img src={selectedImage} alt="Full-Screen View" className="modal-image" />
                        </div>
                    )}
                </>
            ) : (
                <p>Loading album...</p>
            )}
        </div>
    );
};

export default AlbumEditPage;
