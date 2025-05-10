"use client"; 

import { useState, useContext } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UserDetailContext } from '@/context/UserDetailContext';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

export default function Hero() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const CreateUser = useMutation(api.users.CreateUser);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you for your interest! We'll be in touch at ${email}`);
    setEmail('');
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: 'Bearer ' + tokenResponse?.access_token } },
        );
        const user = userInfo.data;

        // Create user in your database
        await CreateUser({
          name: user?.name,
          email: user?.email,
          picture: user?.picture,
          uid: uuidv4(),
          role: 'user'  // Default role for sign-ups from the Hero section
        });

        // Store user details in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify({ ...user, role: 'user' }));
        }
        
        // Update user context
        setUserDetail({ ...user, role: 'user' });

        // Redirect to donation page after successful sign-in
        router.push("/Donation");
      } catch (error) {
        console.error("Login error:", error);
      }
    },
    onError: errorResponse => console.log(errorResponse),
  });

  const handleDonateClick = () => {
    // Directly trigger Google login when Donate Now is clicked
    loginWithGoogle();
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const scaleUp = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const buttonHover = {
    hover: { 
      scale: 1.05,
      boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Main Hero Section */}
        <div className="flex flex-col lg:flex-row items-center lg:space-x-16">
          {/* Hero Content */}
          <motion.div 
            className="lg:w-1/2 space-y-8 text-center lg:text-left"
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
          >
            <motion.div 
              variants={fadeIn}
              className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-2"
            >
              Make a difference today
            </motion.div>
            
            <motion.h1 
              variants={fadeIn}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
            >
              <span className="text-blue-600">Share</span> Food,
              <span className="block mt-1">Spread <span className="text-blue-600">Hope</span></span>
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-xl text-gray-600 max-w-2xl leading-relaxed"
            >
              Join our mission to fight hunger and reduce food waste. Every donation provides essential meals to those who need it most.
            </motion.p>
            
            <motion.div 
              variants={fadeIn}
              className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 pt-2"
            >
              <motion.button 
                onClick={handleDonateClick}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-100 hover:shadow-blue-200"
                variants={buttonHover}
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
              >
                Donate Now
              </motion.button>
              <motion.button 
                className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all"
                variants={buttonHover}
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
              >
                Learn More
              </motion.button>
            </motion.div>
          </motion.div>
          
          {/* Hero Image */}
          <motion.div 
            className="lg:w-1/2 mt-12 lg:mt-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div 
              className="relative h-[450px] w-full rounded-xl overflow-hidden shadow-xl"
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
            >
              <Image
                src="/hero.jpg"
                alt="People donating food"
                fill
                style={{ objectFit: "cover" }}
                priority
                className="rounded-xl"
              />
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              ></motion.div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Impact Stats */}
        <motion.div 
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
        >
          <motion.div 
            className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm text-center hover:shadow-md transition-all"
            variants={scaleUp}
            whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)" }}
          >
            <span className="text-5xl font-bold text-blue-600">2M+</span>
            <p className="mt-3 text-gray-600 font-medium">Meals Donated</p>
          </motion.div>
          <motion.div 
            className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm text-center hover:shadow-md transition-all"
            variants={scaleUp}
            whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)" }}
          >
            <span className="text-5xl font-bold text-blue-600">500+</span>
            <p className="mt-3 text-gray-600 font-medium">Partner Organizations</p>
          </motion.div>
          <motion.div 
            className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm text-center hover:shadow-md transition-all"
            variants={scaleUp}
            whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)" }}
          >
            <span className="text-5xl font-bold text-blue-600">50K+</span>
            <p className="mt-3 text-gray-600 font-medium">Families Helped</p>
          </motion.div>
        </motion.div>
        
        {/* Newsletter / Get Involved */}
        <motion.div 
          className="mt-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-10 md:p-14 shadow-xl relative overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Decorative elements */}
          <motion.div 
            className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-full -mr-20 -mt-20"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, 0],
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full -ml-10 -mb-10"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, -5, 0],
            }}
            transition={{ 
              duration: 7, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          
          <div className="text-center max-w-3xl mx-auto relative z-10">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Join Our Mission
            </motion.h2>
            <motion.p 
              className="mt-4 text-lg text-gray-600 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Stay updated on our campaigns and learn how you can make a difference in your community.
            </motion.p>
            <motion.form 
              onSubmit={handleSubmit} 
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <motion.div className="flex-grow max-w-md relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="w-full px-5 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm border border-gray-100"
                />
                <motion.span 
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 to-indigo-500/20 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              <motion.button 
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                whileHover={{ 
                  scale: 1.03,
                  boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                Get Involved
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.button>
            </motion.form>
            <motion.p 
              className="text-sm text-gray-500 mt-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              We respect your privacy. Unsubscribe at any time.
            </motion.p>
          </div>
        </motion.div>
        
        {/* Features */}
        <div className="mt-24">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-2">
              Ways to contribute
            </div>
            <h2 className="text-3xl font-bold text-gray-900">How You Can Help</h2>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerChildren}
          >
            <motion.div 
              className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all"
              variants={scaleUp}
              whileHover={{ y: -7 }}
            >
              <motion.div 
                className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-6"
                whileHover={{ rotate: 5, scale: 1.1 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900">Donate Funds</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">Your financial contribution helps us purchase fresh food and essential supplies to feed those in need.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all"
              variants={scaleUp}
              whileHover={{ y: -7 }}
            >
              <motion.div 
                className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-6"
                whileHover={{ rotate: 5, scale: 1.1 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900">Donate Food</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">Non-perishable items, fresh produce, and prepared meals are always needed at our distribution centers.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all"
              variants={scaleUp}
              whileHover={{ y: -7 }}
            >
              <motion.div 
                className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-6"
                whileHover={{ rotate: 5, scale: 1.1 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900">Volunteer Time</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">Help sort donations, prepare meals, or deliver food to those in need in your local community.</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Testimonials */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900">What People Say</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our donors and volunteers share their experiences
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerChildren}
          >
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
              variants={fadeIn}
              whileHover={{ y: -10, boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-center mb-4">
                <motion.div 
                  className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  JD
                </motion.div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">Jane Doe</h4>
                  <p className="text-gray-500 text-sm">Regular Donor</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"Donating to this organization has been one of the most rewarding experiences. Knowing I'm helping families in need means everything."</p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
              variants={fadeIn}
              whileHover={{ y: -10, boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-center mb-4">
                <motion.div 
                  className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  MS
                </motion.div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">Mark Smith</h4>
                  <p className="text-gray-500 text-sm">Volunteer</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"Volunteering here has opened my eyes to the food insecurity in our community. The team is amazing and the impact is real."</p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
              variants={fadeIn}
              whileHover={{ y: -10, boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-center mb-4">
                <motion.div 
                  className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  AJ
                </motion.div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">Aisha Johnson</h4>
                  <p className="text-gray-500 text-sm">Corporate Partner</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"Our company's partnership with this food donation initiative has been incredible. The team is professional and truly dedicated."</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}