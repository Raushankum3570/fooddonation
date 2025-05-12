"use client"
import React, { useState, useEffect } from 'react'
import { GitPullRequest, HandCoins, LayoutDashboard, Soup, UserPen, ChevronLeft, Bell, HelpCircle, LogOut, Heart, Menu, StickyNote, MessageSquareDiff } from 'lucide-react'
import { useParams, usePathname, useRouter } from 'next/navigation'

function SideNav() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setMobileView(true);
        setCollapsed(true);
      } else {
        setMobileView(false);
        setMobileMenuOpen(false);
      }
    };

    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuList = [
    {
      id: 1,
      name: 'Dashboard',
      icons: LayoutDashboard,
      path: "/Donation"
    },
    {
      id: 2,
      name: 'Food Donations',
      icons: Soup,
      path: '/Donation/fooddonation'
    },
    {
      id: 3,
      name: 'Money Donations',
      icons: HandCoins,
      path: '/Donation/moneydonation'
    },
    {
      id: 4,
      name: 'Requests',
      icons: GitPullRequest,
      path: '/Donation/requests'
    },
    {
      id: 5,
      name: 'Profiles',
      icons: UserPen,
      path: '/Donation/profiles'
    },
     {
      id: 6,
      name: 'Post',
      icons: MessageSquareDiff,
      path: '/Donation/post'
    },
      
  ];

  const path = usePathname();
  const router = useRouter();
  const { id } = useParams();

  const handleNavigation = (navPath) => {
    router.push(navPath);
    if (mobileView) {
      setMobileMenuOpen(false);
    }
  };

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Show mobile hamburger menu
  if (mobileView && !mobileMenuOpen) {
    return (
      <div className="fixed top-0 left-0 z-50">
        <button 
          onClick={toggleMobileMenu}
          className="m-4 bg-purple-600 p-2 rounded-full text-white shadow-lg hover:bg-purple-700 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`fixed h-screen border-r bg-gradient-to-b from-white to-purple-50 shadow-lg transition-all duration-300 z-40
        ${mobileView 
          ? mobileMenuOpen ? 'left-0' : '-left-full' 
          : collapsed ? 'w-20' : 'w-64'
        }`}
    >
      {!mobileView && (
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 bg-purple-600 p-1 rounded-full text-white shadow-md hover:bg-purple-700 transition-colors z-10"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      )}
      
      {mobileView && (
        <button 
          onClick={toggleMobileMenu}
          className="absolute top-4 right-4 bg-purple-600 p-2 rounded-full text-white shadow-md hover:bg-purple-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      
      <div className="p-6">
        <div className={`flex items-center gap-3 mb-12 ${(collapsed && !mobileView) ? 'justify-center' : ''}`}>
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-2 rounded-lg shadow-md">
            <Heart className="text-white h-6 w-6" />
          </div>
          {(!collapsed || mobileView) && (
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">Food Share</h2>
          )}
        </div>
        
        <div className="space-y-3">
          {menuList.map((menu) => (
            <button
              key={menu.id}
              onClick={() => handleNavigation(menu.path)}
              className={`flex items-center w-full gap-4 p-3 rounded-lg transition-all duration-200 ${
                (collapsed && !mobileView) ? 'justify-center' : ''
              } ${
                path === menu.path 
                  ? 'bg-purple-600 text-white font-medium shadow-md' 
                  : 'text-gray-600 hover:bg-purple-100 hover:text-purple-600'
              }`}
              title={(collapsed && !mobileView) ? menu.name : ''}
            >
              <menu.icons className={`h-5 w-5 ${path === menu.path ? 'text-white' : 'text-gray-500'}`} />
              {(!collapsed || mobileView) && (
                <>
                  <span>{menu.name}</span>
                  {path === menu.path && 
                    <div className="ml-auto w-1.5 h-6 bg-white rounded-full"></div>
                  }
                </>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div className={`absolute bottom-8 w-full px-6 ${(collapsed && !mobileView) ? 'flex justify-center' : ''}`}>
        {(!collapsed || mobileView) ? (
          <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <p className="text-sm text-purple-800 font-medium">Donations</p>
              <Bell className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600 mt-1">You've helped 24 people this month!</p>
            <div className="mt-2 bg-white rounded-full h-2 w-full">
              <div className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full w-2/3"></div>
            </div>
            <div className="mt-3 flex space-x-2">
              <button className="flex-1 text-xs bg-purple-600 text-white py-2 px-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-1 shadow-sm">
                <Heart className="h-3 w-3" /> Donate
              </button>
              <button className="flex-1 text-xs border border-purple-600 text-purple-600 py-2 px-2 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-1">
                <HelpCircle className="h-3 w-3" /> Help
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <button className="bg-purple-600 p-2 rounded-full text-white hover:bg-purple-700 transition-colors shadow-sm">
              <Heart className="h-5 w-5" />
            </button>
            <button className="bg-gray-200 p-2 rounded-full text-gray-600 hover:bg-gray-300 transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SideNav