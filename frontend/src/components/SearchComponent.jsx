import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SearchComponent.css'; // 确保路径正确

const SearchComponent = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate(); // 使用 useNavigate

    const handleSearch = (e) => {
        e.preventDefault();
        if (query) {
            navigate(`/search?q=${query}`); // 重定向到搜索结果页面
            window.location.reload(); // 刷新页面
        }
    };

    return (
        <form className="search-component" onSubmit={handleSearch}>
            <div className="search-input-container">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search albums or users"
                />
                <button type="submit" className="search-button">Search</button>
            </div>
        </form>
    );
};

export default SearchComponent;
