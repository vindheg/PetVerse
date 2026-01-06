import React from 'react';
import './DotsLoader.css';

const DotsLoader = ({ text = '' }) => {
    return (
        <div className="dots-loader-container">
            <div className="dots-container">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
            </div>
            {text && <p className="dots-loader-text">{text}</p>}
        </div>
    );
};

export default DotsLoader;
