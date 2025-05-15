"use client"

import { Button } from '@/components/ui/button'
import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useMutation } from 'convex/react';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image'
import React, { useContext, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation';

function Header() {
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const CreateUser = useMutation(api.users.CreateUser);
  const router = useRouter();
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const loginMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Define a whitelist of admin emails.
  const allowedAdminEmails = ["3570kumarraushan@gmail.com", "special@company.com"];

  // Define login functions using useGoogleLogin.
  const loginAsUser = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      processLogin(tokenResponse, 'user');
    },
    onError: errorResponse => console.log(errorResponse),
  });

  const loginAsAdmin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      processLogin(tokenResponse, 'admin');
    },
    onError: errorResponse => console.log(errorResponse),
  });

  // Helper function to process login.
  const processLogin = async (tokenResponse, role) => {
    try {
      const userInfo = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: 'Bearer ' + tokenResponse?.access_token } },
      );
      const user = userInfo.data;

      // Call the CreateUser mutation with the provided role.
      await CreateUser({
        name: user?.name,
        email: user?.email,
        picture: user?.picture,
        uid: uuidv4(),
        role: role
      });

      // Store user details in localStorage and update context.
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify({ ...user, role }));
      }
      setUserDetail({ ...user, role });

      // Navigate based on role.
      if (role === 'admin') {
        if (allowedAdminEmails.includes(user.email)) {
          router.push("/Admin");
        } else {
          alert("You are not authorized to access the admin panel.");
          router.push("/Donation");
        }
      } else {
        router.push("/Donation");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  // Handler to sign out the user.
  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    setUserDetail(null);
    router.push("/");
  };
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      
      if (loginMenuRef.current && !loginMenuRef.current.contains(event.target)) {
        setShowLoginOptions(false);
      }
      
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle navigation scroll
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setShowMobileMenu(false);
  };  return (
    <div className="py-3 px-5 border-b shadow-md sticky top-0 z-50 bg-white/95 backdrop-blur-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center">
          <Image src={'/logo.svg'} width={150} height={150} alt="Logo" 
            className="hover:opacity-90 transition-opacity" />
        </div>
          {/* Navigation Links - Desktop */}
        <div className="hidden md:flex space-x-8 mx-10">
          {[
            { id: 'features', label: 'Features' },
            { id: 'impact', label: 'Impact' },
            { id: 'testimonials', label: 'Testimonials' },
            { id: 'join', label: 'Join Us' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="font-medium text-gray-600 hover:text-blue-600 transition-colors relative group py-2"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </button>
          ))}
        </div>
          {/* Mobile menu button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            className="p-2 rounded-full hover:bg-blue-50"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </Button>
        </div>
        
        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div 
            ref={mobileMenuRef}
            className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-xl rounded-b-lg border-t md:hidden z-50 animate-fadeIn"
            style={{animationDuration: '0.2s'}}
          >
            <div className="flex flex-col p-4 space-y-2 max-w-7xl mx-auto">
              {[
                { id: 'features', label: 'Features', icon: '✨' },
                { id: 'impact', label: 'Impact', icon: '📊' },
                { id: 'testimonials', label: 'Testimonials', icon: '💬' },
                { id: 'join', label: 'Join Us', icon: '👋' }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="py-3 px-4 text-left font-medium hover:bg-blue-50 rounded-lg flex items-center space-x-3 transition-colors"
                >
                  <span className="bg-blue-100 text-blue-600 w-8 h-8 flex items-center justify-center rounded-full">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
              
              {!userDetail && (
                <div className="pt-2 border-t">
                  <Button 
                    className="w-full justify-center"
                    onClick={() => setShowLoginOptions(true)}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
          {userDetail ? (
          // If user is logged in, show profile dropdown with options
          <div className="relative" ref={profileMenuRef}>
            <Button 
              variant="ghost" 
              className="rounded-full hover:bg-blue-50 transition-colors"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Image 
                    src={userDetail.picture} 
                    width={36} 
                    height={36} 
                    alt="Profile" 
                    className="rounded-full border-2 border-blue-100"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <span className="font-medium">{userDetail.name}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </Button>
            
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-10 border overflow-hidden">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">{userDetail.name}</p>
                  <p className="text-xs text-gray-500 truncate">{userDetail.email}</p>
                </div>
                <Button
                  variant="ghost"
                  className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-blue-50"
                  onClick={() => {
                    router.push("/Donation/profiles");
                    setShowProfileMenu(false);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  User Profile
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    handleSignOut();
                    setShowProfileMenu(false);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm7 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm1 5a1 1 0 100 2h4a1 1 0 100-2h-4z" clipRule="evenodd" />
                  </svg>
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        ) : (
          // If no user is logged in, show the login options.
          <div className="flex justify-between items-center gap-3">
            <Button 
              variant="outline" 
              className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
            >
              Dashboard
            </Button>
            <div className="relative" ref={loginMenuRef}>
              {showLoginOptions ? (
                <>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-10 border overflow-hidden animate-fadeIn" style={{animationDuration: '0.2s'}}>
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">Welcome</p>
                      <p className="text-xs text-gray-500">Select your login method</p>
                    </div>
                    <Button
                      variant="ghost"
                      className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-blue-50"
                      onClick={() => {
                        loginAsUser();
                        setShowLoginOptions(false);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      Login as User
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-blue-50"
                      onClick={() => {
                        loginAsAdmin();
                        setShowLoginOptions(false);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                      </svg>
                      Login as Admin
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="rounded-full hover:bg-blue-50"
                    onClick={() => setShowLoginOptions(false)}
                  >
                    Get Started
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 rotate-180" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </>
              ) : (
                <Button 
                  variant="primary" 
                  className="rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:shadow-md hover:from-blue-600 hover:to-blue-800"
                  onClick={() => setShowLoginOptions(true)}
                >
                  Get Started
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
