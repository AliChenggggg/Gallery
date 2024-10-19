import React, { useState } from 'react';
import '../styles/ImageUpload.css';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const ImageUpload = ({ albumId }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        if (file) {
            handleSubmit(file);
        }
    };

    const handleSubmit = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('album', albumId);

        const token = localStorage.getItem('ACCESS_TOKEN');
        console.log('Token from localStorage:', token);

        try {
            setUploading(true); // Set uploading state to true

            const response = await axios.post(`${API_URL}/api/images/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Image uploaded successfully:', response.data);
            window.location.reload(); // Refresh
        } catch (error) {
            console.error('Error uploading image:', error.response ? error.response.data : error.message);
        } finally {
            setUploading(false); // Set uploading state to false
        }
    };

    return (
        <div className="image-upload-container">
            {uploading && <div className="uploading-message">Uploading...</div>} {/* Uploading indicator */}
            <form onSubmit={(e) => e.preventDefault()} className="image-upload-form">
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="image-upload-input"
                    id="fileInput"
                    disabled={uploading} // Disable input while uploading
                />
                <label
                    htmlFor="fileInput"
                    className="image-upload-button"
                >
                    Add A New Picture
                </label>
            </form>
        </div>
    );
};

export default ImageUpload;
