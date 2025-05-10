// app/Donation/layout.js
"use client";
import React from 'react';
import SideNav from './_componentes/SideNav';

export default function DonationLayout({ children }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {/* Persistent Side Navigation */}
      <div className="col-span-1">
        <SideNav />
      </div>
      {/* Dynamic main content based on the route */}
      <div className="col-span-4">
        {children}
      </div>
    </div>
  );
}
