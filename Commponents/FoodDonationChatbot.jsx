"use client"
import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const FoodDonationChatbot = ({ userId }) => {
  // States for chat functionality
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your Food Donation Assistant. How can I help you today? You can ask about your donations, community impact, or how to make new donations.' 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch relevant data from Convex
  const userDonations = useQuery(api.donations.getUserDonations, 
    userId ? { userId } : { userId: undefined }
  );
  const globalStats = useQuery(api.donations.getGlobalStats);
  const foodRequests = useQuery(api.foodRequests.getAllFoodRequests);

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Process user message and get response from Gemini API
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare context data for the Gemini API
      const contextData = {
        userDonationCount: userDonations?.length || 0,
        totalCommunityDonations: globalStats?.allDonations?.length || 0,
        pendingRequests: foodRequests?.filter(req => req.status === 'pending').length || 0,
        userHasDonated: userDonations && userDonations.length > 0,
        recentDonationDate: userDonations && userDonations.length > 0 ? 
          new Date(Math.max(...userDonations.map(d => d.createdAt))).toLocaleDateString() : null,
        topCategories: getTopCategories(),
        isLoggedIn: !!userId
      };

      // Call to your backend that interfaces with Gemini API
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          context: contextData,
          history: messages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot API');
      }

      const data = await response.json();
      
      // Add assistant response to chat
      setMessages(prevMessages => [...prevMessages, { 
        role: 'assistant', 
        content: data.response 
      }]);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      
      // Add error message to chat
      setMessages(prevMessages => [...prevMessages, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get top donation categories
  const getTopCategories = () => {
    if (!globalStats?.allDonations) return [];
    
    const categories = globalStats.allDonations.reduce((acc, donation) => {
      const category = donation.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  };

  // Handle sending message when Enter key is pressed
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick suggestion buttons
  const suggestions = [
    "How many donations have I made?",
    "What food items are needed?",
    "How to donate money?",
    "Show community impact"
  ];

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md h-[500px] max-w-md mx-auto">
      {/* Chatbot header */}
      <div className="bg-green-500 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Food Donation Assistant
        </h2>
      </div>
      
      {/* Chat messages area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`p-3 rounded-lg max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-blue-100 text-gray-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 p-3 rounded-lg flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick suggestions */}
      <div className="px-4 pb-2 flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => {
              setInputMessage(suggestion);
              setTimeout(() => handleSendMessage(), 100);
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-1 px-2 rounded-full"
          >
            {suggestion}
          </button>
        ))}
      </div>
      
      {/* Input area */}
      <div className="border-t p-4">
        <div className="flex items-center">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none h-10 max-h-20 overflow-auto"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className={`bg-green-500 text-white p-2 rounded-r-lg h-10 ${
              isLoading || !inputMessage.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodDonationChatbot;