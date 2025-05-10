"use client"
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import FoodDonationChatbot from '@/Commponents/FoodDonationChatbot';

  // Import the chatbot component

const DonationDashboard = ({ userId = null }) => {
  // State management
  const [selectedView, setSelectedView] = useState(userId ? 'personal' : 'global');
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);  // Add this state for the chatbot toggle
  
  // Fetch data from Convex
  const userDonations = useQuery(api.donations.getUserDonations, 
    userId ? { userId } : { userId: undefined }
  );
  const globalStats = useQuery(api.donations.getGlobalStats);
  const foodRequests = useQuery(api.foodRequests.getAllFoodRequests);
  const moneyDonations = useQuery(api.moneyDonations.getAllMoneyDonations);
  
  // Derived state for charts
  const [donationTrends, setDonationTrends] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalDonations: 0,
    activeDonors: 0,
    pendingRequests: 0,
    totalAmount: 0
  });
  
  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Process data when it changes
  useEffect(() => {
    if (!userDonations && !globalStats) return;
    
    processData();
  }, [userDonations, globalStats, foodRequests, moneyDonations, selectedView, timeRange]);
  
  const processData = () => {
    // Get the appropriate data based on selected view
    const donations = selectedView === 'personal' && userDonations 
      ? userDonations 
      : (globalStats?.allDonations || []);
    
    // Time filtering logic
    const now = Date.now();
    const timeFilters = {
      week: now - (7 * 24 * 60 * 60 * 1000),
      month: now - (30 * 24 * 60 * 60 * 1000),
      year: now - (365 * 24 * 60 * 60 * 1000)
    };
    
    const filteredDonations = donations.filter(
      d => d.createdAt >= timeFilters[timeRange]
    );
    
    // Process donation trends by date
    const donationsByDate = filteredDonations.reduce((acc, donation) => {
      const date = new Date(donation.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!acc[date]) {
        acc[date] = { name: date, count: 0 };
      }
      acc[date].count++;
      return acc;
    }, {});
    
    const trendsData = Object.values(donationsByDate)
      .sort((a, b) => new Date(a.name) - new Date(b.name));
    
    setDonationTrends(trendsData);
    
    // Process category data for pie chart
    const categories = filteredDonations.reduce((acc, donation) => {
      const category = donation.category || 'Other';
      
      if (!acc[category]) {
        acc[category] = { name: category, value: 0 };
      }
      acc[category].value++;
      return acc;
    }, {});
    
    setCategoryData(Object.values(categories));
    
    // Calculate summary statistics
    const pendingReqs = foodRequests?.filter(req => req.status === 'pending').length || 0;
    const donorCount = selectedView === 'personal' 
      ? 1 
      : new Set(donations.map(d => d.userId || 'anonymous')).size;
    
    const relevantMoneyDonations = selectedView === 'personal' && userId
      ? moneyDonations?.filter(d => d.donorName === userId) || []
      : moneyDonations || [];
    
    const totalAmount = relevantMoneyDonations.reduce(
      (sum, d) => sum + d.donationAmount, 0
    );
    
    setSummaryStats({
      totalDonations: filteredDonations.length,
      activeDonors: donorCount,
      pendingRequests: pendingReqs,
      totalAmount
    });
  };
  
  if (!userDonations && !globalStats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 p-6 rounded-lg relative">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          {selectedView === 'personal' ? 'My Donation Impact' : 'Community Impact'}
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* View selector */}
          {userId && (
            <div className="flex rounded-md overflow-hidden border border-gray-300">
              <button 
                onClick={() => setSelectedView('personal')}
                className={`px-3 py-1 text-sm ${
                  selectedView === 'personal' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-700'
                }`}
              >
                My Donations
              </button>
              <button 
                onClick={() => setSelectedView('global')}
                className={`px-3 py-1 text-sm ${
                  selectedView === 'global' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-700'
                }`}
              >
                Community
              </button>
            </div>
          )}
          
          {/* Time range selector */}
          <div className="flex rounded-md overflow-hidden border border-gray-300">
            <button 
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 text-sm ${
                timeRange === 'week' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700'
              }`}
            >
              Week
            </button>
            <button 
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 text-sm ${
                timeRange === 'month' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700'
              }`}
            >
              Month
            </button>
            <button 
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1 text-sm ${
                timeRange === 'year' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700'
              }`}
            >
              Year
            </button>
          </div>
        </div>
      </div>
      
      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total donations */}
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase">
            {selectedView === 'personal' ? 'My Donations' : 'Total Donations'}
          </h3>
          <p className="mt-1 text-2xl font-bold text-gray-800">
            {summaryStats.totalDonations}
          </p>
          <p className="text-xs text-gray-500">
            in the last {timeRange === 'week' ? '7 days' : timeRange === 'month' ? '30 days' : 'year'}
          </p>
        </div>
        
        {/* Active donors */}
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase">
            {selectedView === 'personal' ? 'Donor Status' : 'Active Donors'}
          </h3>
          <p className="mt-1 text-2xl font-bold text-gray-800">
            {summaryStats.activeDonors}
          </p>
          <p className="text-xs text-gray-500">
            {selectedView === 'personal' ? 'contribution status' : 'unique contributors'}
          </p>
        </div>
        
        {/* Pending requests */}
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase">
            Pending Requests
          </h3>
          <p className="mt-1 text-2xl font-bold text-gray-800">
            {summaryStats.pendingRequests}
          </p>
          <p className="text-xs text-gray-500">
            awaiting fulfillment
          </p>
        </div>
        
        {/* Money donations */}
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase">
            {selectedView === 'personal' ? 'My Contributions' : 'Total Funds'}
          </h3>
          <p className="mt-1 text-2xl font-bold text-gray-800">
            ₹{summaryStats.totalAmount.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            monetary donations
          </p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation trends */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Donation Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={donationTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Donations"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Donation categories */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Donation Categories</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No category data available for the selected period
            </div>
          )}
        </div>
      </div>

      {/* Chatbot button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          className="group bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          aria-label={isChatbotOpen ? "Close donation assistant" : "Open donation assistant"}
        >
          {isChatbotOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="absolute opacity-0 group-hover:opacity-100 right-full mr-2 bg-black bg-opacity-75 text-white text-xs rounded py-1 px-2 whitespace-nowrap transition-opacity duration-200">
                Donation Assistant
              </span>
            </>
          )}
        </button>
      </div>
      
      {/* Chatbot panel */}
      <div 
        className={`fixed bottom-20 right-6 z-40 w-80 md:w-96 transition-all duration-300 ease-in-out transform ${
          isChatbotOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col border border-gray-200 h-[500px] max-h-[80vh]">
          {/* Chat header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-green-300 animate-pulse"></span>
              </div>
              <div>
                <h3 className="font-medium">Donation Assistant</h3>
                <p className="text-xs text-green-100">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsChatbotOpen(false)} 
                className="text-white hover:text-gray-200 focus:outline-none transition-transform duration-200 hover:rotate-90"
                aria-label="Close chatbot"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Chat content wrapper */}
          <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <FoodDonationChatbot userId={userId} />
            </div>
            
            {/* Quick actions */}
            <div className="p-2 border-t border-gray-200 bg-white">
              <div className="flex flex-wrap gap-2 justify-center">
                <button className="bg-green-100 hover:bg-green-200 text-green-800 text-xs py-1 px-3 rounded-full transition-colors">
                  How to donate?
                </button>
                <button className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs py-1 px-3 rounded-full transition-colors">
                  Food needed
                </button>
                <button className="bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs py-1 px-3 rounded-full transition-colors">
                  Donation process
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chat tooltip */}
        <div className="absolute -top-10 left-0 right-0 flex justify-center pointer-events-none">
          <div className="bg-green-600 text-white text-xs px-3 py-1 rounded shadow-lg animate-bounce">
            Ask about food donations!
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationDashboard;