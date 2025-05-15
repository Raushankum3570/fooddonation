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
    <div className="flex flex-col bg-white rounded-2xl shadow-xl h-[500px] max-w-md mx-auto border border-blue-100 overflow-hidden">
      {/* Chatbot header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center">
            <div className="bg-white/20 rounded-full p-1.5 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            Food Donation Assistant
          </h2>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs text-white/80">Online</span>
          </div>
        </div>
      </div>
      
      {/* Chat messages area */}
      <div className="flex-1 p-5 overflow-y-auto bg-gradient-to-b from-blue-50/30 to-white">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role !== 'user' && (
              <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center mr-2 shadow-sm flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
              </div>
            )}
            <div 
              className={`p-3 rounded-xl max-w-[75%] shadow-sm ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white ml-2' 
                  : 'bg-white border border-gray-100 text-gray-700'
              }`}
            >
              {message.content}
            </div>
            {message.role === 'user' && (
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs ml-2 shadow-sm flex-shrink-0 border-2 border-white">
                {userDonations?.length ? 'D' : 'U'}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center mr-2 shadow-sm flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick suggestions */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setInputMessage(suggestion);
                setTimeout(() => handleSendMessage(), 100);
              }}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs py-1.5 px-3 rounded-full border border-blue-100 transition-colors duration-200 flex items-center"
            >
              {index === 0 && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
              {index === 1 && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              )}
              {index === 2 && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              )}
              {index === 3 && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
              )}
              {suggestion}
            </button>
          ))}
        </div>
      </div>
      
      {/* Input area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 pr-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-300 transition-all">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none p-3 focus:outline-none resize-none h-10 max-h-20 overflow-auto"
            rows={1}
          />
          {!inputMessage.trim() ? (
            <button className="p-2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </button>
          ) : null}
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className={`p-2 rounded-full ${
              isLoading || !inputMessage.trim() 
                ? 'text-gray-400' 
                : 'text-blue-500 hover:text-blue-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodDonationChatbot;