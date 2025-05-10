"use client";
import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import * as XLSX from 'xlsx';

export default function AdminDashboard() {
  // State for different data types
  const [activeTab, setActiveTab] = useState("donations");
  const [isExporting, setIsExporting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Fetch data from Convex
  const donations = useQuery(api.donations.getRecentDonations) || [];
  const foodRequests = useQuery(api.foodRequests.getAllFoodRequests) || [];
  const moneyDonations = useQuery(api.moneyDonations.getAllMoneyDonations) || [];
  const users = useQuery(api.users.getAllUsers) || [];

  // Format date for display
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get active data based on selected tab
  const getActiveData = () => {
    switch(activeTab) {
      case "donations":
        return donations;
      case "foodRequests":
        return foodRequests;
      case "moneyDonations":
        return moneyDonations;
      case "users":
        return users;
      default:
        return [];
    }
  };

  // Export data to Excel
  const exportToExcel = () => {
    setIsExporting(true);
    try {
      const data = getActiveData();
      
      // Create a worksheet from the data
      const worksheet = XLSX.utils.json_to_sheet(
        data.map(item => {
          // Format timestamps and cleanup data for Excel
          const formattedItem = { ...item };
          if (formattedItem.createdAt) {
            formattedItem.createdAt = formatDate(formattedItem.createdAt);
          }
          // Remove any complex objects that can't be serialized to Excel
          Object.keys(formattedItem).forEach(key => {
            if (typeof formattedItem[key] === 'object' && formattedItem[key] !== null && !Array.isArray(formattedItem[key])) {
              formattedItem[key] = JSON.stringify(formattedItem[key]);
            }
          });
          return formattedItem;
        })
      );
      
      // Create workbook and add the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, activeTab);
      
      // Generate Excel file and trigger download
      XLSX.writeFile(workbook, `food-donation-${activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // New function to handle delete confirmation
  const confirmDelete = (item) => {
    setItemToDelete(item);
    setShowConfirmation(true);
  };

  const handleDelete = () => {
    // Implement actual delete logic here
    console.log("Deleting:", itemToDelete);
    // After deletion logic, close the confirmation dialog
    setShowConfirmation(false);
    setItemToDelete(null);
  };

  // Render table headers based on active tab
  const renderTableHeaders = () => {
    switch(activeTab) {
      case "donations":
        return (
          <tr>
            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-600">Food Name</th>
            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-600">Description</th>
            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-600">Image</th>
            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-600">Donated At</th>
            <th className="px-6 py-3 border-b text-center text-sm font-medium text-gray-600">Actions</th>
          </tr>
        );
      case "foodRequests":
        return (
          <tr>
            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-600">Name</th>
            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-600">Contact</th>
            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-600">Location</th>
            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-600">Food Description</th>
            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-600">Quantity</th>
            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-600">Status</th>
            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-600">Created At</th>
            <th className="px-6 py-3 border-b text-center text-sm font-medium text-gray-600">Actions</th>
          </tr>
        );
      case "moneyDonations":
        return (
          <tr>
            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-600">Donor Name</th>
            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-600">Amount</th>
            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-600">Transaction ID</th>
            <th className="px-6 py-3 border-b text-center text-sm font-medium text-gray-600">Actions</th>
          </tr>
        );
      case "users":
        return (
          <tr>
            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-600">Name</th>
            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-600">Email</th>
            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-600">Role</th>
            <th className="px-6 py-3 border-b text-center text-sm font-medium text-gray-600">Actions</th>
          </tr>
        );
      default:
        return null;
    }
  };

  // Render table rows based on active tab
  const renderTableRows = () => {
    const data = getActiveData();
    
    if (!data || data.length === 0) {
      return (
        <tr>
          <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
            No data available
          </td>
        </tr>
      );
    }

    switch(activeTab) {
      case "donations":
        return data.map((donation) => (
          <tr key={donation._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 border-b text-gray-700">{donation.foodName}</td>
            <td className="px-6 py-4 border-b text-gray-700">{donation.description}</td>
            <td className="px-6 py-4 border-b">
              {donation.imageUrl ? (
                <img
                  className="h-16 w-16 object-cover rounded"
                  src={donation.imageUrl}
                  alt={donation.foodName || "Food donation"}
                  onError={(e) => e.target.src = "https://via.placeholder.com/150?text=No+Image"}
                />
              ) : (
                <div className="h-16 w-16 bg-gray-100 flex items-center justify-center rounded">
                  <span className="text-xs text-gray-500">No image</span>
                </div>
              )}
            </td>
            <td className="px-6 py-4 border-b text-gray-700">
              {formatDate(donation.createdAt)}
            </td>
            <td className="px-6 py-4 border-b text-center">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2 transition-colors">
                Edit
              </button>
              <button 
                onClick={() => confirmDelete(donation)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
              >
                Delete
              </button>
            </td>
          </tr>
        ));
      case "foodRequests":
        return data.map((request) => (
          <tr key={request._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 border-b text-gray-700">{request.name}</td>
            <td className="px-6 py-4 border-b text-gray-700">{request.contact}</td>
            <td className="px-6 py-4 border-b text-gray-700">{request.location}</td>
            <td className="px-6 py-4 border-b text-gray-700">{request.foodDescription}</td>
            <td className="px-6 py-4 border-b text-gray-700">{request.quantity}</td>
            <td className="px-6 py-4 border-b text-gray-700">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                request.status === 'fulfilled' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {request.status || 'pending'}
              </span>
            </td>
            <td className="px-6 py-4 border-b text-gray-700">
              {formatDate(request.createdAt)}
            </td>
            <td className="px-6 py-4 border-b text-center">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2">
                Edit
              </button>
              <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                Delete
              </button>
            </td>
          </tr>
        ));
      case "moneyDonations":
        return data.map((donation) => (
          <tr key={donation._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 border-b text-gray-700">{donation.donorName}</td>
            <td className="px-6 py-4 border-b text-gray-700">₹{donation.donationAmount.toFixed(2)}</td>
            <td className="px-6 py-4 border-b text-gray-700">{donation.transactionId || 'N/A'}</td>
            <td className="px-6 py-4 border-b text-center">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2">
                View
              </button>
              <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                Delete
              </button>
            </td>
          </tr>
        ));
      case "users":
        return data.map((user) => (
          <tr key={user._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 border-b text-gray-700">{user.name}</td>
            <td className="px-6 py-4 border-b text-gray-700">{user.email}</td>
            <td className="px-6 py-4 border-b text-gray-700">{user.role || 'User'}</td>
            <td className="px-6 py-4 border-b text-center">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2">
                Edit
              </button>
              <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                Delete
              </button>
            </td>
          </tr>
        ));
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Food Donation Admin</h1>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={exportToExcel}
            disabled={isExporting}
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded flex items-center transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                <span>Export to Excel</span>
              </>
            )}
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors">
            Add {activeTab.slice(0, -1)}
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap border-b">
        <button
          onClick={() => setActiveTab("donations")}
          className={`py-2 px-4 font-medium ${
            activeTab === "donations"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500 hover:text-gray-700"
          } transition-colors`}
        >
          Donations
        </button>
        <button
          onClick={() => setActiveTab("foodRequests")}
          className={`py-2 px-4 font-medium ${
            activeTab === "foodRequests"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500 hover:text-gray-700"
          } transition-colors`}
        >
          Food Requests
        </button>
        <button
          onClick={() => setActiveTab("moneyDonations")}
          className={`py-2 px-4 font-medium ${
            activeTab === "moneyDonations"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500 hover:text-gray-700"
          } transition-colors`}
        >
          Money Donations
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`py-2 px-4 font-medium ${
            activeTab === "users"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500 hover:text-gray-700"
          } transition-colors`}
        >
          Users
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {renderTableHeaders()}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {renderTableRows()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirmation(false)} 
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
