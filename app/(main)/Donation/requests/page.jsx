"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function RequestPage() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    location: '',
    foodDescription: '',
    quantity: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    apiAvailable: false,
    mutationAvailable: false,
    error: null
  });
  
  // Check if API and mutation are available
  useEffect(() => {
    setDebugInfo({
      apiAvailable: !!api,
      mutationAvailable: !!(api && api.foodRequests && api.foodRequests.createFoodRequest),
      error: null
    });
    
    console.log("API check:", {
      api: !!api,
      foodRequests: !!(api && api.foodRequests),
      createFoodRequest: !!(api && api.foodRequests && api.foodRequests.createFoodRequest)
    });
  }, []);
  
  // Get the Convex mutation
  const createFoodRequest = useMutation(api.foodRequests.createFoodRequest);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setDebugInfo(prev => ({ ...prev, error: null }));
    
    try {
      // Log what we're trying to submit
      console.log("Attempting to submit:", {
        name: formData.name,
        contact: formData.contact,
        location: formData.location,
        foodDescription: formData.foodDescription,
        quantity: parseInt(formData.quantity, 10) || 0,
      });
      
      // Submit to Convex
      const result = await createFoodRequest({
        name: formData.name,
        contact: formData.contact,
        location: formData.location,
        foodDescription: formData.foodDescription,
        quantity: parseInt(formData.quantity, 10) || 0,
      });
      
      console.log("Submission successful, result:", result);
      
      // Clear form and show success message
      setFormData({
        name: '',
        contact: '',
        location: '',
        foodDescription: '',
        quantity: '',
      });
      
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting request:", error);
      
      // Store detailed error information
      setDebugInfo(prev => ({ 
        ...prev, 
        error: {
          message: error.message || "Unknown error",
          stack: error.stack,
          name: error.name,
          full: JSON.stringify(error, null, 2)
        }
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render debug information if there are issues
  if (!debugInfo.apiAvailable || !debugInfo.mutationAvailable) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-red-600 text-xl font-bold">Convex Integration Error</h2>
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p className="font-semibold">API Available: {debugInfo.apiAvailable ? "✅" : "❌"}</p>
            <p className="font-semibold">Mutation Available: {debugInfo.mutationAvailable ? "✅" : "❌"}</p>
          </div>
          <div className="mt-4">
            <p className="text-gray-700">This error usually occurs because:</p>
            <ul className="list-disc ml-5 mt-2">
              <li>The Convex API hasn't been generated correctly</li>
              <li>The foodRequests module hasn't been created or is incorrect</li>
              <li>The ConvexProvider is missing from your app</li>
            </ul>
          </div>
          <div className="mt-4">
            <p className="font-semibold">Recommended actions:</p>
            <ol className="list-decimal ml-5 mt-2">
              <li>Run <code className="bg-gray-200 px-1">npx convex dev</code> to start the Convex development server</li>
              <li>Check that <code className="bg-gray-200 px-1">convex/foodRequests.js</code> exists and is correctly formatted</li>
              <li>Verify your schema includes the foodRequests table</li>
              <li>Ensure your app is wrapped with ConvexProvider</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="mb-6 text-center text-3xl font-extrabold text-gray-900">
          Request Food Donation
        </h2>
        
        {submitSuccess && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            Your request has been successfully submitted! We'll contact you soon.
          </div>
        )}
        
        {debugInfo.error && (
          <div className="mb-4">
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-bold">Error: {debugInfo.error.message}</p>
              <p className="text-sm mt-1">Type: {debugInfo.error.name}</p>
            </div>
            <details className="mt-2 border border-gray-200 rounded p-2">
              <summary className="cursor-pointer font-medium">Technical Details</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 overflow-auto rounded">
                {debugInfo.error.full}
              </pre>
            </details>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Your Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
              Contact Information
            </label>
            <input
              type="text"
              name="contact"
              id="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="foodDescription" className="block text-sm font-medium text-gray-700">
              Food Description
            </label>
            <textarea
              name="foodDescription"
              id="foodDescription"
              rows="3"
              value={formData.foodDescription}
              onChange={handleChange}
              required
              className="mt-1 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe the food items you need"
            ></textarea>
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity Required
            </label>
            <input
              type="number"
              name="quantity"
              id="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RequestPage;