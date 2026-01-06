// ChatBotWindow.jsx - Main chat window
import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import QuickQuestions from './QuickQuestions';
import { quickQuestions, getBotResponse } from './chatbotData';
import './Chatbot.css';

const ChatBotWindow = ({ onClose, onSendMessage }) => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: "Hello! 🐾 I'm your PetVerse assistant. How can I help you today? Ask me about adoption, pet care, volunteering, or anything pet-related!",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const addBotResponse = (text) => {
        setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    text,
                    sender: 'bot',
                    timestamp: new Date()
                }
            ]);
            setIsTyping(false);
        }, 800);
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isTyping) return;

        const userMessage = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const messageText = inputValue;
        setInputValue('');

        // Use AI service if provided, otherwise use keyword matching
        if (onSendMessage) {
            setIsTyping(true);
            try {
                const response = await onSendMessage(messageText);
                setIsTyping(false);
                const aiMessage = {
                    id: (Date.now() + 1).toString(),
                    text: response,
                    sender: 'bot',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMessage]);
            } catch (error) {
                setIsTyping(false);
                addBotResponse("I'm having trouble connecting right now. Please try again in a moment.");
            }
        } else {
            const response = getBotResponse(messageText);
            addBotResponse(response);
        }
    };

    const handleQuickQuestion = (question) => {
        const userMessage = {
            id: Date.now().toString(),
            text: question.text,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        addBotResponse(question.answer);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chatbot-window-new">
            {/* Header */}
            <div className="chatbot-header-new">
                <div className="header-left">
                    <div className="avatar-circle">
                        <span>🤖</span>
                    </div>
                    <div>
                        <h3>PetVerse Assistant</h3>
                        <p>Always here to help 🐕</p>
                    </div>
                </div>
                <button onClick={onClose} className="close-btn-new">
                    ×
                </button>
            </div>

            {/* Messages */}
            <div className="messages-container-new" ref={scrollRef}>
                <div className="messages-inner">
                    {messages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                    ))}
                    {isTyping && (
                        <div className="typing-indicator">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Questions */}
            {messages.length <= 2 && (
                <div className="quick-questions-wrapper">
                    <QuickQuestions questions={quickQuestions} onSelect={handleQuickQuestion} />
                </div>
            )}

            {/* Input */}
            <div className="input-area-new">
                <div className="input-wrapper-new">
                    <input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your question..."
                        className="chat-input-new"
                        disabled={isTyping}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isTyping}
                        className="send-btn-new"
                    >
                        <span>➤</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBotWindow;
