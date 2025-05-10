"use client";
import React, { useContext, useState, useRef } from 'react';
import { UserDetailContext } from '@/context/UserDetailContext';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Shield, 
  Edit, 
  LogOut,
  Phone,
  MapPin,
  Calendar,
  Loader
} from 'lucide-react';

function ProfilePage() {
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const router = useRouter();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!userDetail) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">No Profile Found</h1>
        <p>Please log in to view your profile.</p>
        <Button onClick={() => router.push("/")}>Go to Login</Button>
      </div>
    );
  }

  const handleSignOut = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
      setUserDetail(null);
      router.push("/");
    }, 500);
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    // Simulate image upload
    // In a real app, you would upload to a server/cloud storage
    const reader = new FileReader();
    reader.onload = (event) => {
      setTimeout(() => {
        setUserDetail({
          ...userDetail,
          picture: event.target.result
        });
        
        // Update in localStorage
        if (typeof window !== 'undefined') {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          userData.picture = event.target.result;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        setIsUploading(false);
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex justify-center items-center py-10 px-4">
      <div className="bg-white shadow-xl rounded-xl overflow-hidden max-w-md w-full">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex flex-col items-center">
            <div className="relative">
              {isUploading ? (
                <div className="w-[120px] h-[120px] rounded-full border-4 border-white shadow-lg flex items-center justify-center bg-gray-200">
                  <Loader className="animate-spin text-blue-500" size={30} />
                </div>
              ) : (
                <Image
                  src={userDetail.picture || "/default-avatar.png"}
                  width={120}
                  height={120}
                  alt="User Profile"
                  className="rounded-full border-4 border-white shadow-lg object-cover"
                />
              )}
              <button 
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 bg-white text-blue-500 p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                title="Change profile picture"
              >
                <Edit size={16} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </div>
            <h2 className="mt-4 text-2xl font-bold">{userDetail.name}</h2>
            {userDetail.title && (
              <p className="text-blue-100 mt-1">{userDetail.title}</p>
            )}
          </div>
        </div>
        
        {/* Profile Details */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Mail className="text-blue-500" size={20} />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{userDetail.email}</p>
              </div>
            </div>
            
            {/* Phone (Optional) */}
            {userDetail.phone && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Phone className="text-blue-500" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{userDetail.phone}</p>
                </div>
              </div>
            )}
            
            {/* Role */}
            {userDetail.role && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Shield className="text-blue-500" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Role</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium capitalize">{userDetail.role}</p>
                    {userDetail.role === "admin" && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Admin</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Join Date (Optional) */}
            {userDetail.joinDate && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Calendar className="text-blue-500" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{new Date(userDetail.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="mt-8 space-y-3">
            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center space-x-2 transition-all duration-200 transform hover:-translate-y-1"
              onClick={() => router.push("/profile/edit")}
            >
              <Edit size={16} />
              <span>Edit Profile</span>
            </Button>
            
            {showConfirmation ? (
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <p className="text-sm text-center mb-3">Are you sure you want to sign out?</p>
                <div className="flex space-x-3">
                  <Button 
                    onClick={handleSignOut} 
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader className="animate-spin mr-2" size={16} />
                    ) : (
                      <LogOut size={16} className="mr-2" />
                    )}
                    Sign Out
                  </Button>
                  <Button 
                    onClick={() => setShowConfirmation(false)} 
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={() => setShowConfirmation(true)} 
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 flex items-center justify-center space-x-2 transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
