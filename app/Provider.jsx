"use client"
import Header from '@/Commponents/Header'
import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useConvex } from 'convex/react';
import React, { useEffect, useState } from 'react'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import SideNav from './(main)/Donation/_componentes/SideNav';

function Provider({children}) {
    const [userDetail, setUserDetail] = useState();
    const convex = useConvex();

    useEffect(() => {
        isAuthenticated();
    }, []);

    const isAuthenticated = async () => {
        if(typeof window !== 'undefined') {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user?.email) {
                    const result = await convex.query(api.users.GetUser, {email: user.email});
                    setUserDetail(result);
                    console.log(result);
                }
            } catch (error) {
                console.error("Authentication error:", error);
            }
        }
    }

    return (
        <div>
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
                <UserDetailContext.Provider value={{userDetail, setUserDetail}}>
                

                        <Header/>
                        
                        {children}
                        
                    
                </UserDetailContext.Provider>
            </GoogleOAuthProvider>
        </div>
    )
}

export default Provider