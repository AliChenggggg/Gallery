import React, { useState, useEffect } from 'react';
import '../styles/modal.css';

const DropdownMenu = ({ username, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        setIsOpen(prev => !prev);
    };

    const handleOutsideClick = (e) => {
        if (e.target.closest('.dropdown') === null) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    const handleMyAlbumsClick = () => {
        // Navigate to the "My Albums" page programmatically
        window.location.href = '/albums';
    };

    return (
        <div className="dropdown">
            <button className="navbar-button dropdown-toggle" onClick={handleClick}>
                {username}
            </button>
            {isOpen && (
                <div className="dropdown-menu">
                    <ul>
                        <li className="dropdown-item" onClick={handleMyAlbumsClick}>My Albums</li>
                        <li className="dropdown-item" onClick={onLogout}>Logout</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;
