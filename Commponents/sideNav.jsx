"use client"
import React from 'react'
import { LayoutDashboard, Gift, Users, Bell, BarChart2 } from 'lucide-react'

function SideNav() {
    const menuList = [
        { id: 1, name: 'Dashboard', icon: LayoutDashboard },
        { id: 2, name: 'Donations', icon: Gift },
        { id: 3, name: 'Users', icon: Users },
        { id: 4, name: 'Reports', icon: BarChart2 },
        { id: 5, name: 'Notifications', icon: Bell },
    ];

    return (
        <div className="bg-green-100 p-6 h-screen w-64 shadow-md">
            <h2 className="text-2xl font-bold mb-8">🍲 Food Donation</h2>
            <ul>
                {menuList.map(item => (
                    <li 
                        key={item.id} 
                        className="flex items-center gap-3 py-3 px-4 cursor-pointer 
                        hover:bg-green-200 rounded-md transition-all duration-200"
                    >
                        <item.icon size={24} />
                        <span className="font-medium">{item.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default SideNav;
