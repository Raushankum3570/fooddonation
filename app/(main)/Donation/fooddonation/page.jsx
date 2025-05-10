// components/FoodDonationForm.jsx
"use client"
import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from "./../../../../convex/_generated/api";

const FoodDonationForm = () => {
  const addDonation = useMutation(api.donations.addDonation);
  const [formData, setFormData] = useState({
    foodName: "",
    description: "",
    quantity: 1,
    expiryDate: "",
    location: "",
    contactPhone: "",
    email: "", // Added email field
    name: "", // Added name field
    category: "Other"
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [emailSendSuccess, setEmailSendSuccess] = useState(true);

  // Helper function to convert a file into a base64.
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleImageUpload = async () => {
    if (!imageFile) return null;
    try {
      const base64Image = await toBase64(imageFile);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: base64Image }),
      });
      const json = await res.json();
      if (res.ok) {
        return json.imageUrl;
      } else {
        setError(json.error || "Image upload failed");
        return null;
      }
    } catch (err) {
      setError("Error processing image");
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const sendThankYouEmail = async (email, foodName, name) => {
    try {
      console.log(`Attempting to send thank you email to: ${email}`);
      
      const response = await fetch('/api/send-thank-you', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          foodName,
          name,
        }),
      });
      
      const responseData = await response.json();
      console.log('Email API response:', responseData);
      
      // Check if this is a development mode simulated success
      if (responseData.success && responseData.simulated) {
        console.info('DEV MODE: Email sending was simulated successfully');
        return { 
          success: true,
          simulated: true,
          message: responseData.message
        };
      }
      
      // Check if this is a development mode limitation (email can't be sent to non-verified addresses)
      if (responseData.devMode && !responseData.emailSent) {
        console.info('DEV MODE: Email sending limitation - using verified addresses only');
        return {
          success: true, // Treat as success for UI purposes
          devMode: true,
          message: responseData.details || 'In development mode, emails can only be sent to verified addresses'
        };
      }
      
      // Standard handling for real email sends
      if (response.ok) {
        if (!responseData.emailSent) {
          console.warn(`Email not sent: ${responseData.details || responseData.message || 'Unknown reason'}`);
          return { 
            success: false, 
            error: responseData.details || responseData.message || 'Email could not be sent'
          };
        }
        
        console.log('Thank you email sent successfully');
        return { success: true };
      }
      
      // Handle error responses
      const errorDetail = responseData.message 
        ? `${responseData.message}: ${responseData.details || ''}` 
        : `Status: ${response.status}`;
      
      console.error(`Email API error: ${errorDetail}`);
      return { success: false, error: errorDetail };
    } catch (error) {
      console.error('Exception sending thank you email:', error.message || error);
      return { success: false, error: error.message || 'Network or parsing error' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setUploading(true);
    setEmailSendSuccess(true); // Reset email status

    // First, upload the image to Cloudinary.
    const imageUrl = await handleImageUpload();
    if (!imageUrl && imageFile) {
      setUploading(false);
      return;
    }

    // Store email and name locally but don't send them to Convex
    const userEmail = formData.email;
    const userName = formData.name;
    
    // Create a copy of formData without the email and name fields
    const { email, name, ...donationData } = formData;

    // Then, insert the donation data into Convex.
    try {
      await addDonation({ 
        ...donationData, 
        imageUrl: imageUrl || "" 
      });
      
      // Send thank you email if email is provided
      if (userEmail) {
        try {
          const emailResult = await sendThankYouEmail(userEmail, formData.foodName, userName);
          
          if (!emailResult.success) {
            setEmailSendSuccess(false);
            setError(prevError => prevError || `Email notification could not be sent: ${emailResult.error || 'Unknown error'}`);
            console.warn(`Failed to send thank you email: ${emailResult.error || 'Unknown error'}`);
          } else if (emailResult.simulated || emailResult.devMode) {
            // Email was simulated in development mode
            setEmailSendSuccess(true);
            console.info(`Development mode: ${emailResult.message}`);
          } else {
            // Real email was actually sent
            setEmailSendSuccess(true);
          }
        } catch (emailError) {
          // Catch any unexpected errors in the email sending process
          setEmailSendSuccess(false);
          setError(prevError => prevError || "Failed to send confirmation email, but your donation was recorded.");
          console.error("Email sending error:", emailError.message || emailError);
        }
      }
      
      // Reset form fields after success.
      setFormData({
        foodName: "",
        description: "",
        quantity: 1,
        expiryDate: "",
        location: "",
        contactPhone: "",
        email: "", // Reset email field
        name: "", // Reset name field
        category: "Other"
      });
      setImageFile(null);
      
      // Show success alert
      setShowSuccessAlert(true);
      // Hide the alert after 5 seconds
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000);
    } catch (err) {
      console.error("Error submitting donation:", err);
      setError("Error submitting donation. Please try again.");
    }
    setUploading(false);
  };

  const closeAlert = () => {
    setShowSuccessAlert(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 mt-10 relative">
      {showSuccessAlert && (
        <div className="absolute top-0 left-0 right-0 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-t-lg flex justify-between items-center">
          <div>
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">
              Your food donation has been submitted and will help someone in need. 
              {formData.email && emailSendSuccess ? 
                " A thank you email has been sent to your email address." : 
                formData.email && !emailSendSuccess ? 
                " We couldn't send a confirmation email, but your donation was recorded successfully." : 
                ""}
            </span>
          </div>
          <button 
            onClick={closeAlert}
            className="text-green-700 hover:text-green-900 font-bold"
            aria-label="Close alert"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Show a specific error about email if it exists */}
      {error && (
        <div className="mb-4 text-red-600 text-center p-3 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      
      <h2 className="text-center text-3xl font-bold mb-6 text-green-600">Share Your Food Donation</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="foodName">
              Food Name*
            </label>
            <input
              id="foodName"
              name="foodName"
              type="text"
              placeholder="What food are you donating?"
              value={formData.foodName}
              onChange={handleChange}
              required
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            >
              <option value="Fruits">Fruits</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Grains">Grains & Bread</option>
              <option value="Protein">Protein & Meat</option>
              <option value="Dairy">Dairy</option>
              <option value="Canned">Canned Goods</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        
        {/* Add name field below the food details section */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Your Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Your name (for personalized thank you)"
            value={formData.name}
            onChange={handleChange}
            className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description*
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Please describe the food, quantity, condition, etc."
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
              Quantity
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expiryDate">
              Expiry Date (if applicable)
            </label>
            <input
              id="expiryDate"
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleChange}
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
              Pickup Location*
            </label>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="Address or area for pickup"
              value={formData.location}
              onChange={handleChange}
              required
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactPhone">
              Contact Phone
            </label>
            <input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              placeholder="Phone number for coordination"
              value={formData.contactPhone}
              onChange={handleChange}
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email Address
            <span className="text-xs font-normal text-green-600 ml-1">(Real Email Sending Enabled)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Your email to receive confirmation"
            value={formData.email}
            onChange={handleChange}
            className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            We'll send an actual thank you email to this address after your donation is submitted.
          </p>
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUpload">
            Food Image
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="hidden"
            />
            <label htmlFor="imageUpload" className="cursor-pointer">
              <div className="space-y-2">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-sm text-gray-600">
                  {imageFile ? imageFile.name : "Click to upload a photo"}
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </label>
          </div>
        </div>
        
        <div className="flex items-center justify-center pt-4">
          <button
            type="submit"
            disabled={uploading}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors w-full md:w-auto"
          >
            {uploading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : "Submit Donation"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FoodDonationForm;