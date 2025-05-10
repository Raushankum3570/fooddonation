"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function MoneyDonation() {
  const [donorName, setDonorName] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  
  // Mutation to store donation data in Convex.
  const createMoneyDonation = useMutation(api.moneyDonations.createMoneyDonation);
  
  // Prevent default form submission since PayPal handles the transaction.
  const handleFormSubmit = (e) => {
    e.preventDefault();
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-green-600 text-center mb-6">🍲 Donate for Food</h1>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="donorName">
              Donor Name
            </label>
            <input
              type="text"
              id="donorName"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Your Name"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="donationAmount">
              Donation Amount (₹)
            </label>
            <input
              type="number"
              id="donationAmount"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter Amount"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              required
            />
          </div>
          
          {/* PayPal Payment Option */}
          <div className="mt-6">
            <p className="text-center text-gray-700 mb-4">Donate with PayPal</p>
            <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_CLIENT_ID }}>
              <PayPalButtons
                style={{ layout: "horizontal" }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [{
                      amount: {
                        // PayPal requires the amount as a string; note conversion may be needed for INR.
                        value: donationAmount.toString(),
                      },
                    }],
                  });
                }}
                onApprove={(data, actions) => {
                  return actions.order.capture().then((details) => {
                    // On successful transaction, store donation data in Convex.
                    createMoneyDonation({
                      donorName,
                      donationAmount: parseFloat(donationAmount),
                      transactionId: details.id,
                    });
                    alert(`Thank you, ${donorName}, for your donation of ₹${donationAmount}! Transaction ID: ${details.id}`);
                  });
                }}
              />
            </PayPalScriptProvider>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MoneyDonation;