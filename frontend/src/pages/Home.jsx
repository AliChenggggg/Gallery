import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/Gallery.css'; 
import '../styles/Footer.css'; // 引入新的 Footer 样式文件

const categories = ['Social', 'Share', 'Seek'];
const images = [
  { src: 'src/styles/Social.png', alt: 'Vase 1', category: 'Social' },
  { src: 'src/styles/Share.png', alt: 'Bowl 1', category: 'Share' },
  { src: 'src/styles/Seek.png', alt: 'Sculpture 1', category: 'Seek' },
];

const Gallery = () => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [flip, setFlip] = useState(false);
  const activeCategory = categories[activeCategoryIndex];
  const filteredImages = images.filter(img => img.category === activeCategory);

  useEffect(() => {
    const interval = isAutoScroll ? setInterval(() => {
      setFlip(true);
      setTimeout(() => {
        setActiveCategoryIndex((prevIndex) => (prevIndex + 1) % categories.length);
        setFlip(false);
      }, 300);
    }, 3000) : null;

    return () => clearInterval(interval);
  }, [isAutoScroll]);

  const handleCategoryClick = (index) => {
    setFlip(true);
    setActiveCategoryIndex(index);
    setIsAutoScroll(false);
    setTimeout(() => setFlip(false), 300);
  };

  const username = localStorage.getItem('username');

  return (

    <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center p-8">
      <div className="home mb-12 text-center">
            <header className="home-header">
                {username ? (
                    <h1>Welcome to Gallery, {username}!</h1>
                ) : (
                    <h1>- G a l l e r y -</h1>
                )}
            </header>


            <main className="home-main">
                {username ? (
          <div className="button-container mb-4">
            <Link to="/albums" className="home-button">Publishing A New Artwork</Link>


          </div>
                ) : (
                    <div className="guest-container">
                        <p>Join our community of artists and showcase your talent!</p>
                        <div className="button-container">
                            <Link to="/login" className="home-button">Login</Link>
                            <Link to="/register" className="home-button">Register</Link>
                        </div>
                    </div>
                )}


        </main>
      </div>



      <nav className="category-wrapper mb-8">
        <ul className="category-container flex justify-center">
          {categories.map((category, index) => (
            <li key={category}>
              <button
                className={`category-button ${activeCategoryIndex === index ? 'active' : ''}`}
                onClick={() => handleCategoryClick(index)}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="gallery flex flex-wrap justify-center gap-8 w-full">
        <div className={`gallery-image-container ${flip ? 'flip' : ''}`}>
          {filteredImages.map((image, index) => (
            <div key={index} className="gallery-image bg-gray-800 p-4 rounded-lg flex flex-col items-center">
              <img src={image.src} alt={image.alt} className="w-full h-64 object-cover mb-4 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 添加自定义页脚 */}
      <Footer />
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h2>About Gallery</h2>
          <p>
            Gallery is a platform where artists can upload and share their creative works. 
            We believe in the power of art to bring people together and inspire creativity.
          </p>
        </div>

      </div>
      
    </footer>
  );
};

export default Gallery;
