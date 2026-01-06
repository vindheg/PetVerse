import React from 'react';
import './ThemeToggle.css';

const ThemeToggle = ({ isDarkMode, onToggle }) => {
    return (
        <label className="theme-switch">
            <input
                type="checkbox"
                checked={isDarkMode}
                onChange={onToggle}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            />
            <span className="slider"></span>
        </label>
    );
};

export default ThemeToggle;
