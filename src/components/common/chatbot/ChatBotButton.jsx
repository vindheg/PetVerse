// ChatBotButton.jsx - Toggle button with animations
import React from 'react';
import './Chatbot.css';

const ChatBotButton = ({ isOpen, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`chatbot-toggle-new ${isOpen ? 'is-open' : ''}`}
        >
            <div className={`icon-wrapper ${isOpen ? 'rotate' : ''}`}>
                {isOpen ? (
                    <span className="icon-x">×</span>
                ) : (
                    <span className="icon-chat">💬</span>
                )}
            </div>

            {/* Pulse animation when closed */}
            {!isOpen && (
                <span className="pulse-ring"></span>
            )}
        </button>
    );
};

export default ChatBotButton;
