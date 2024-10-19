import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import '../styles/Form.css';
import LoadingIndicator from './LoadingIndicator';

function Form({ route, method }) {
    const [username, setUsername] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const name = method === 'login' ? 'Login' : 'Register';

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        setError(''); // Clear any previous errors

        try {
            const data = method === 'register'
                ? { username, nickname, password }
                : { username, password };

            const res = await api.post(route, data);

            if (method === 'login') {
                // Save tokens to localStorage
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                localStorage.setItem('username', username); // Save username to localStorage

                setUsername(username); // Update state to immediately display username

                // Debug: output tokens to console
                console.log('Access Token:', res.data.access);
                console.log('Refresh Token:', res.data.refresh);

                window.location.href = '/';
            } else {
                navigate('/login');
            }
        } catch (error) {
            if (error.response) {
                if (method === 'register' && error.response.status === 400 && error.response.data.username) {
                    setError('Username already exists. Please choose a different username.');
                } else if (method === 'login' && error.response.status === 401) {
                    setError('Invalid username or password. Please try again.');
                } else {
                    setError(error.response.data.detail || 'An error occurred');
                }
            } else {
                setError('An error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>

            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />


            {loading && <LoadingIndicator />}
            {error && <p className="error-message">{error}</p>}

            <button className="form-button" type="submit">
                {name}
            </button>

            {method === 'login' && (
                <p>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            )}
            {method === 'register' && (
                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            )}
        </form>
    );
}

export default Form;
