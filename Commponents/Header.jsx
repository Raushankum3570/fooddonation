"use client"

import { Button } from '@/components/ui/button'
import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useMutation } from 'convex/react';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image'
import React, { useContext, useState } from 'react'
import { useRouter } from 'next/navigation';

function Header() {
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const CreateUser = useMutation(api.users.CreateUser);
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(false);

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

  return (
    <div className="p-3 border shadow-sm">
      <div className="flex justify-between items-center">
        <Image src={'/logo.svg'} width={50} height={50} alt="Logo" />
        {userDetail ? (
          // If user is logged in, show only the profile and sign out options.
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/Profile")}>
              <div className="flex items-center gap-2">
                <Image src={userDetail.picture} width={32} height={32} alt="Profile" className="rounded-full" />
                <span>{userDetail.name}</span>
              </div>
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        ) : (
          // If no user is logged in, show the login options.
          <div className="flex justify-between items-center gap-5">
            <Button variant="outline">Dashboard</Button>
            {showOptions ? (
              <div className="relative">
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                  <Button
                    variant="ghost"
                    className="block w-full text-left px-4 py-2 text-sm"
                    onClick={() => {
                      loginAsUser();
                      setShowOptions(false);
                    }}
                  >
                    Login as User
                  </Button>
                  <Button
                    variant="ghost"
                    className="block w-full text-left px-4 py-2 text-sm"
                    onClick={() => {
                      loginAsAdmin();
                      setShowOptions(false);
                    }}
                  >
                    Login as Admin
                  </Button>
                </div>
                <Button variant="ghost" onClick={() => setShowOptions(false)}>
                  Get Started
                </Button>
              </div>
            ) : (
              <Button variant="ghost" onClick={() => setShowOptions(true)}>
                Get Started
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
