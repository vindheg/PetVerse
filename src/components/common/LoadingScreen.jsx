import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ minDuration = 2000 }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isFading, setIsFading] = useState(false);
    const [visibleChars, setVisibleChars] = useState(0);
    const brandName = 'PetVerse';

    useEffect(() => {
        const revealInterval = setInterval(() => {
            setVisibleChars(prev => {
                if (prev < brandName.length) {
                    return prev + 1;
                }
                clearInterval(revealInterval);
                return prev;
            });
        }, 150);

        return () => clearInterval(revealInterval);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFading(true);
            setTimeout(() => setIsVisible(false), 400);
        }, minDuration);

        return () => clearTimeout(timer);
    }, [minDuration]);

    if (!isVisible) return null;

    return (
        <div className={`loading-screen ${isFading ? 'fade-out' : ''}`}>
            <div className="loading-content">
                <h1 className="loading-brand">
                    {brandName.split('').map((char, index) => (
                        <span
                            key={index}
                            className={`brand-letter ${index < visibleChars ? 'visible' : ''}`}
                        >
                            {char}
                        </span>
                    ))}
                </h1>
            </div>
        </div>
    );
};

export default LoadingScreen;
