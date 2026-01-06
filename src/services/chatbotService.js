// src/services/chatbotService.js - SIMPLIFIED VERSION
import { supabase } from './supabase';

export const chatbotService = {
  async sendMessageToAI(message) {
    console.log('SERVICE STEP 1: Called with message:', message);
    
    try {
      // Get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('SERVICE STEP 2: Session:', session ? 'Exists' : 'Missing');
      
      if (sessionError) {
        console.error('SESSION ERROR:', sessionError);
        throw sessionError;
      }
      
      if (!session) {
        console.log('ERROR: No session found');
        throw new Error('Not authenticated');
      }
      
      console.log('SERVICE STEP 3: Access token exists:', !!session.access_token);
      
      // DIRECT FETCH - Most reliable
      console.log('SERVICE STEP 4: Making fetch request to Edge Function...');
      
      const response = await fetch('https://mregdwyqmjurjnforhxa.supabase.co/functions/v1/chat-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          message: message,
          language: 'en'
        })
      });
      
      console.log('SERVICE STEP 5: Response status:', response.status);
      console.log('SERVICE STEP 6: Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP ERROR:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }
      
      const data = await response.json();
      console.log('SERVICE STEP 7: Parsed response:', data);
      
      return {
        success: true,
        response: data?.reply || data?.response || data?.message || "Thanks for your message!"
      };
      
    } catch (error) {
      console.error('SERVICE CATCH ERROR:', error);
      
      return {
        success: false,
        response: "Sorry, the chatbot is having issues. Please try again later.",
        error: error.message
      };
    }
  }
};