import React from 'react';
import '../styles/ProgressBar.css';

const ProgressBar = ({ images, onDropImage, onDeleteImage }) => {
    const handleDragStart = (e, image) => {
        e.dataTransfer.setData('text/plain', JSON.stringify(image));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, position) => {
        e.preventDefault();
        const image = JSON.parse(e.dataTransfer.getData('text/plain'));
        onDropImage(image, position);
    };

    return (
        <div className="progress-bar">
            <div className="progress-line"></div>
            {images.map((image, index) => (
                <div
                    key={image.id}
                    className="progress-point"
                    draggable
                    onDragStart={(e) => handleDragStart(e, image)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                >
                    <img
                        src={image.image}
                        alt="Thumbnail"
                        className="progress-bar-image"
                    />
                    <button
                        className="delete-button"
                        onClick={() => onDeleteImage(image.id)}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ProgressBar;