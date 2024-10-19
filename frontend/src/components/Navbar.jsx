import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';
import DropdownMenu from '../components/Modal.jsx'; // 确保路径正确
import SearchComponent from '../components/SearchComponent';

const API_URL = import.meta.env.VITE_API_URL;

const Navbar = () => {
    const [username, setUsername] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoggedOut, setIsLoggedOut] = useState(false); // Track if the user is logged out
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }

        const checkTokenValidity = async () => {
            if (isLoggedOut) return;

            // Skip token validation for home, search, and login pages
            if (location.pathname === '/' || location.pathname.startsWith('/search') || location.pathname === '/login' || location.pathname.startsWith('/register')|| location.pathname.startsWith('/users')) return;

            const token = localStorage.getItem('ACCESS_TOKEN');
            if (token) {
                const response = await fetch(`${API_URL}/api/token/verify/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                if (!response.ok) {
                    handleLogout('expired');
                }
            } else {
                handleLogout('expired');
            }
        };

        checkTokenValidity(); // Check token validity on mount

        const intervalId = setInterval(checkTokenValidity, 1000);

        return () => clearInterval(intervalId); // Clear interval on component unmount
    }, [isLoggedOut, location.pathname]);

    const handleLogout = (reason) => {
        if (!isLoggedOut) {
            setIsLoggedOut(true); // Mark the user as logged out to prevent multiple notifications
            localStorage.clear();
            setUsername('');
            if (reason === 'expired') {
                alert('Your session has expired. Please log in again.');
            } else {
                alert('You have been logged out successfully.');
            }
            navigate('/login'); // Redirect to the login page
        }
    };

    const handleSearchResults = (results) => {
        setSearchResults(results);
    };

    const handleNoticeClick = () => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        if (!token) {
            alert('You need to be logged in to view this page.');
            navigate('/login');
        } else {
            navigate('/notice');
        }
    };

    const handleHomeClick = () => {
        navigate(''); // Navigate to home page
    };
    const handleChatroomClick = () => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        if (!token) {
            alert('You need to be logged in to view this page.');
            navigate('/login');
        } else {
            navigate('/pubchat/chatroom');
        }
    };


    return (
        <nav className="navbar">
            <div className="navbar-left">
                <button className="navbar-home-button" onClick={handleHomeClick}>Home</button>
                <button className="navbar-chatroom-button" onClick={handleChatroomClick}>ChatRoom</button>
                <SearchComponent onSearchResults={handleSearchResults}/>
            </div>
            <div className="navbar-right">
                <ul>
                <li><span onClick={handleNoticeClick} className="navbar-item">Notice</span></li>
                    {username ? (
                        <li>
                            <DropdownMenu className="navbar-item" username={username} onLogout={() => handleLogout('manual')} />
                        </li>
                    ) : (
                        <li><Link to="/login" className="navbar-item">Login</Link></li>

                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
