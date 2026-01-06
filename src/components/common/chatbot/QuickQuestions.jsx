// QuickQuestions.jsx - Quick question chips
import React from 'react';
import './Chatbot.css';

const QuickQuestions = ({ questions, onSelect }) => {
    return (
        <div className="quick-questions-container">
            <p className="quick-questions-title">Quick Questions</p>
            <div className="quick-questions-grid">
                {questions.slice(0, 4).map((question, index) => (
                    <button
                        key={question.id}
                        onClick={() => onSelect(question)}
                        className="quick-question-btn"
                        style={{
                            animationDelay: `${index * 0.05}s`
                        }}
                    >
                        {question.text}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickQuestions;
