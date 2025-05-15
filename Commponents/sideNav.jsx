"use client"
import React, { useState } from 'react'
import { LayoutDashboard, Gift, Users, Bell, BarChart2, ChevronLeft, HelpCircle, LogOut, Heart } from 'lucide-react'
import { motion } from 'framer-motion';

function SideNav() {
    const [collapsed, setCollapsed] = useState(false);
    
    const menuList = [
        { id: 1, name: 'Dashboard', icon: LayoutDashboard, active: true },
        { id: 2, name: 'Donations', icon: Gift, active: false },
        { id: 3, name: 'Users', icon: Users, active: false },
        { id: 4, name: 'Reports', icon: BarChart2, active: false },
        { id: 5, name: 'Notifications', icon: Bell, badge: 3, active: false },
    ];

    // Animation variants
    const sidebarAnimation = {
        expanded: { width: 256 },
        collapsed: { width: 84 }
    };

    const titleAnimation = {
        expanded: { opacity: 1, x: 0 },
        collapsed: { opacity: 0, x: -20 }
    };

    const menuItemText = {
        expanded: { opacity: 1, x: 0, display: "block" },
        collapsed: { opacity: 0, x: -10, display: "none" }
    };

    return (
        <motion.div 
            className="bg-gradient-to-b from-blue-50 to-white h-screen shadow-lg border-r border-blue-100 relative overflow-hidden"
            animate={collapsed ? "collapsed" : "expanded"}
            variants={sidebarAnimation}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            <div className="p-5">
                <div className="flex items-center mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-lg shadow-md">
                        <Heart className="text-white h-6 w-6" />
                    </div>
                    <motion.h2 
                        className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 ml-3"
                        variants={titleAnimation}
                    >
                        Food Share
                    </motion.h2>
                    <button 
                        onClick={() => setCollapsed(!collapsed)}
                        className="absolute -right-3 top-8 bg-blue-500 p-1.5 rounded-full text-white shadow-md hover:bg-blue-600 transition-colors"
                    >
                        <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>
                
                <div className="space-y-2">
                    {menuList.map((item) => (
                        <motion.div 
                            key={item.id}
                            className={`flex items-center gap-3 p-3 cursor-pointer rounded-lg transition-all duration-300 group
                            ${item.active 
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                                : 'hover:bg-blue-50 text-gray-700'}`}
                            whileHover={{
                                x: 4,
                                transition: { duration: 0.1 }
                            }}
                        >
                            <div className="relative">
                                <item.icon className={`h-5 w-5 ${item.active ? 'text-white' : 'text-blue-500 group-hover:text-blue-600'}`} />
                                {item.badge && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-4 w-4 flex items-center justify-center rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <motion.span 
                                className={`font-medium ${item.active ? 'text-white' : ''}`}
                                variants={menuItemText}
                            >
                                {item.name}
                            </motion.span>
                            {item.active && !collapsed && (
                                <motion.div 
                                    className="ml-auto w-1.5 h-5 bg-white rounded-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
            
            <div className={`absolute bottom-5 w-full px-5`}>
                {!collapsed ? (
                    <motion.div 
                        className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl shadow-sm"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-blue-800 font-medium">Monthly Goal</p>
                            <Bell className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">You've helped 24 people this month!</p>
                        <div className="mt-2 bg-white rounded-full h-2 w-full">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full w-2/3"></div>
                        </div>
                        <div className="mt-3 flex space-x-2">
                            <button className="flex-1 text-xs bg-blue-600 text-white py-1.5 px-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 shadow-sm">
                                <Heart className="h-3 w-3" /> Donate
                            </button>
                            <button className="flex-1 text-xs border border-blue-400 text-blue-600 py-1.5 px-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1">
                                <HelpCircle className="h-3 w-3" /> Help
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        className="flex flex-col items-center space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <button className="bg-blue-500 p-2 rounded-full text-white hover:bg-blue-600 transition-colors shadow-sm">
                            <Heart className="h-5 w-5" />
                        </button>
                        <button className="bg-gray-200 p-2 rounded-full text-gray-600 hover:bg-gray-300 transition-colors">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}

export default SideNav;
