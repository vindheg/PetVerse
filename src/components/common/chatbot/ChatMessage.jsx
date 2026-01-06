// ChatMessage.jsx - Individual message component
import React from 'react';
import './Chatbot.css';

const ChatMessage = ({ message }) => {
    const isBot = message.sender === 'bot';

    return (
        <div
            className={`chat-message ${isBot ? 'bot-message' : 'user-message'}`}
            style={{
                animation: 'slideIn 0.2s ease-out'
            }}
        >
            <div className={`message-bubble ${isBot ? 'bot-bubble' : 'user-bubble'}`}>
                {message.text}
            </div>
        </div>
    );
};

export default ChatMessage;
