// src/components/common/Chatbot.jsx - CORRECTED
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase'; // CHANGED from ../../../ to ../../
import { chatbotService } from '../../services/chatbotService'; // CHANGED from ../../../ to ../../
import ChatBotButton from './chatbot/ChatBotButton'; // Need to specify the chatbot folder
import ChatBotWindow from './chatbot/ChatBotWindow'; // Need to specify the chatbot folder
import './chatbot/Chatbot.css'; // Need to specify the chatbot folder

const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth on mount
  useEffect(() => {
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session?.user);
        // Close chat if user logs out
        if (!session?.user && isOpen) {
          setIsOpen(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [isOpen]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session?.user);
  };

  const toggleChat = () => {
    if (!isAuthenticated) {
      if (window.confirm('Please login to use the PetVerse AI Assistant. Go to login page?')) {
        navigate('/login');
      }
      return;
    }

    setIsOpen(!isOpen);
  };

  // Handle sending messages to AI service
  const handleSendMessage = async (message) => {
    try {
      const result = await chatbotService.sendMessageToAI(message);

      if (result.success) {
        return result.response;
      } else {
        return result.response || "I'm having trouble right now. Please try again.";
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      return "Sorry, I encountered an error. Please try again.";
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && isAuthenticated && (
        <ChatBotWindow
          onClose={() => setIsOpen(false)}
          onSendMessage={handleSendMessage}
        />
      )}

      {/* Toggle Button */}
      <ChatBotButton
        isOpen={isOpen}
        onClick={toggleChat}
      />
    </>
  );
};

export default Chatbot;