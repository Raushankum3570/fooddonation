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
    <div className="bg-gradient-to-b from-white via-blue-50 to-white relative overflow-hidden">
      {/* Enhanced decorative elements with animations */}
      <motion.div 
        className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-100/40 rounded-full blur-3xl -mr-48 -mt-24 z-0"
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.4, 0.5, 0.4]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      ></motion.div>
      <motion.div 
        className="absolute top-1/3 left-0 w-[35rem] h-[35rem] bg-indigo-100/40 rounded-full blur-3xl -ml-24 z-0"
        animate={{ 
          scale: [1, 1.08, 1],
          opacity: [0.3, 0.4, 0.3]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      ></motion.div>
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-cyan-100/30 rounded-full blur-3xl z-0 opacity-60"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative z-10">
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
              className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-medium mb-4 shadow-md relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center">
                <svg className="w-4 h-4 mr-2 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16L7 11L8.4 9.55L11 12.15V4H13V12.15L15.6 9.55L17 11L12 16ZM6 20C5.45 20 4.97917 19.8042 4.5875 19.4125C4.19583 19.0208 4 18.55 4 18V15H6V18H18V15H20V18C20 18.55 19.8042 19.0208 19.4125 19.4125C19.0208 19.8042 18.55 20 18 20H6Z" fill="currentColor"/>
                </svg>
                Make a difference today
              </span>
              <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
            </motion.div>
              <motion.h1 
              variants={fadeIn}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700 relative inline-block">
                Share
                <motion.span 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </span> Food,
              <span className="block mt-2">Spread <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700 relative inline-block">
                Hope
                <motion.span 
                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                />
              </span></span>
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-xl text-gray-600 max-w-2xl leading-relaxed"
            >
              Join our mission to fight hunger and reduce food waste. Every donation provides essential meals to those who need it most.
            </motion.p>
            
            <motion.div 
              variants={fadeIn}
              className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 pt-4"
            >
              <motion.button 
                onClick={handleDonateClick}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-lg transition-all shadow-xl relative overflow-hidden group"
                variants={buttonHover}
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></span>
                <span className="relative z-10 flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4.79L6 7.395V10.5C6 13.517 7.684 16.326 10.5 17.646C11.646 18.217 12.354 18.217 13.5 17.646C16.316 16.326 18 13.517 18 10.5V7.395L12 4.79ZM12 3L19 6V10.5C19 14 17.023 17.23 14 18.694C13 19.232 11 19.232 10 18.694C6.977 17.23 5 14 5 10.5V6L12 3ZM12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12ZM12 6.5C10.07 6.5 8.5 8.07 8.5 10C8.5 11.93 10.07 13.5 12 13.5C13.93 13.5 15.5 11.93 15.5 10C15.5 8.07 13.93 6.5 12 6.5Z" fill="currentColor"/>
                  </svg>
                  Donate Now
                  <motion.span 
                    className="absolute -right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all duration-300"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M13.172 12L8.22198 7.05L9.63598 5.636L16 12L9.63598 18.364L8.22198 16.95L13.172 12Z" fill="currentColor"/>
                    </svg>
                  </motion.span>
                </span>
              </motion.button>
              <motion.button 
                className="px-8 py-4 border-2 border-blue-200 text-blue-700 font-bold rounded-lg transition-all hover:bg-blue-50 relative overflow-hidden group"
                variants={buttonHover}
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
              >
                <span className="absolute inset-0 w-0 bg-blue-100 group-hover:w-full transition-all duration-300 ease-in-out z-0"></span>
                <span className="relative z-10 flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2ZM12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4ZM11 7H13V13H11V7ZM11 15H13V17H11V15Z" fill="currentColor"/>
                  </svg>
                  Learn More
                </span>
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
              className="relative h-[450px] w-full rounded-2xl overflow-hidden shadow-2xl"
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
            >
              {/* Decorative elements */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-400/30 rounded-full blur-xl z-10"></div>
              <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-indigo-400/30 rounded-full blur-xl z-10"></div>
              
              {/* Image wrapper with mask effect */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/30 mix-blend-multiply z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
                <Image
                  src="/hero.jpg"
                  alt="People donating food"
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                  className="rounded-2xl scale-105 hover:scale-100 transition-all duration-700 ease-in-out"
                />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                ></motion.div>
              </div>
              
              {/* Floating stats card */}
              <motion.div 
                className="absolute bottom-6 left-6 right-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl flex items-center gap-3 shadow-2xl border border-white/20">
                  <div className="p-3 bg-blue-600 rounded-full shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-blue-200 font-medium mb-1">IMPACT THIS MONTH</div>
                    <span className="font-bold text-lg">10,000+ meals donated</span>
                  </div>
                  
                  <motion.div
                    className="ml-auto bg-blue-500/30 h-12 w-12 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        {/* Impact Stats */}
        <motion.div 
          id="impact"
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-10 pt-10 scroll-mt-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
        >
          <motion.div 
            className="bg-white p-8 rounded-xl border border-blue-100 shadow-lg text-center hover:shadow-xl transition-all relative overflow-hidden"
            variants={scaleUp}
            whileHover={{ y: -8, boxShadow: "0px 15px 30px rgba(59, 130, 246, 0.2)" }}
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-50 rounded-full opacity-70"></div>
            <div className="relative">
              <span className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-500 to-blue-700">2M+</span>
              <p className="mt-3 text-gray-700 font-semibold">Meals Donated</p>
              <div className="w-16 h-1 bg-blue-500 mx-auto mt-4 rounded-full"></div>
            </div>
          </motion.div>
          <motion.div 
            className="bg-white p-8 rounded-xl border border-blue-100 shadow-lg text-center hover:shadow-xl transition-all relative overflow-hidden"
            variants={scaleUp}
            whileHover={{ y: -8, boxShadow: "0px 15px 30px rgba(59, 130, 246, 0.2)" }}
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-50 rounded-full opacity-70"></div>
            <div className="relative">
              <span className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-500 to-blue-700">500+</span>
              <p className="mt-3 text-gray-700 font-semibold">Partner Organizations</p>
              <div className="w-16 h-1 bg-blue-500 mx-auto mt-4 rounded-full"></div>
            </div>
          </motion.div>
          <motion.div 
            className="bg-white p-8 rounded-xl border border-blue-100 shadow-lg text-center hover:shadow-xl transition-all relative overflow-hidden"
            variants={scaleUp}
            whileHover={{ y: -8, boxShadow: "0px 15px 30px rgba(59, 130, 246, 0.2)" }}
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-50 rounded-full opacity-70"></div>
            <div className="relative">
              <span className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-500 to-blue-700">50K+</span>
              <p className="mt-3 text-gray-700 font-semibold">Families Helped</p>
              <div className="w-16 h-1 bg-blue-500 mx-auto mt-4 rounded-full"></div>
            </div>
          </motion.div>
        </motion.div>        {/* Newsletter / Get Involved */}
        <motion.div 
          id="join"
          className="mt-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-10 md:p-14 shadow-2xl relative overflow-hidden border border-white/50 pt-10 scroll-mt-24"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Decorative elements */}
          <motion.div 
            className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-indigo-400/20 rounded-full -mr-24 -mt-24 backdrop-blur-3xl"
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
            className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-300/20 to-purple-300/20 rounded-full -ml-20 -mb-20 backdrop-blur-3xl"
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
          <motion.div 
            className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/30 rounded-full backdrop-blur-md"
            animate={{ 
              y: [0, -15, 0],
              x: [0, 10, 0],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <div className="text-center max-w-3xl mx-auto relative z-10">
            <motion.div 
              className="inline-block mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full inline-flex items-center gap-2 shadow-lg">
                <div className="bg-blue-600 p-1.5 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800 pr-1.5">Stay Updated</span>
              </div>
            </motion.div>
            
            <motion.h2 
              className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Join Our Mission
            </motion.h2>
            <motion.p 
              className="mt-4 text-lg text-gray-700 leading-relaxed"
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
                  className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md border border-white bg-white/80 backdrop-blur-sm"
                />
                <motion.span 
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/10 to-indigo-500/10 opacity-0 pointer-events-none"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              <motion.button 
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                whileHover={{ 
                  scale: 1.03,
                  boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.6)"
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
              className="text-sm text-gray-600 mt-4"
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
        <div id="features" className="mt-24 pt-10 scroll-mt-24">
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
      </div>      {/* Testimonials */}
      <div id="testimonials" className="bg-gradient-to-b from-white to-blue-50 py-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-4 border border-blue-100">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What People Say</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-blue-300 mx-auto mt-6 rounded-full"></div>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
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
              className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-500 relative overflow-hidden"
              variants={fadeIn}
              whileHover={{ y: -10, boxShadow: "0px 15px 30px rgba(59, 130, 246, 0.15)" }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 opacity-50 rounded-bl-full -mt-8 -mr-8"></div>
              <svg className="h-8 w-8 text-blue-400 mb-4 opacity-30" fill="currentColor" viewBox="0 0 32 32">
                <path d="M10 8c-2.209 0-4 1.791-4 4v10c0 2.209 1.791 4 4 4h12c2.209 0 4-1.791 4-4v-10c0-2.209-1.791-4-4-4h-12zM10 10h12c1.105 0 2 0.895 2 2v10c0 1.105-0.895 2-2 2h-12c-1.105 0-2-0.895-2-2v-10c0-1.105 0.895-2 2-2zM15.398 14.5c0.361 0.45 0.602 1.023 0.602 1.75 0 1.381-1.119 2.5-2.5 2.5s-2.5-1.119-2.5-2.5c0-0.727 0.241-1.3 0.602-1.75-0.365-0.43-0.602-0.977-0.602-1.75 0-1.381 1.119-2.5 2.5-2.5s2.5 1.119 2.5 2.5c0 0.773-0.237 1.32-0.602 1.75zM18.898 14.5c0.361 0.45 0.602 1.023 0.602 1.75 0 1.381-1.119 2.5-2.5 2.5s-2.5-1.119-2.5-2.5c0-0.727 0.241-1.3 0.602-1.75-0.365-0.43-0.602-0.977-0.602-1.75 0-1.381 1.119-2.5 2.5-2.5s2.5 1.119 2.5 2.5c0 0.773-0.237 1.32-0.602 1.75z"></path>
              </svg>
              <div className="flex items-center mb-6">
                <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-blue-200 shadow-inner">
                  <motion.div 
                    className="h-full w-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    JD
                  </motion.div>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 text-lg">Jane Doe</h4>
                  <p className="text-blue-500 text-sm font-medium">Regular Donor</p>
                </div>
              </div>
              <p className="text-gray-600">"Donating to this organization has been one of the most rewarding experiences. Knowing I'm helping families in need means everything."</p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-500 relative overflow-hidden"
              variants={fadeIn}
              whileHover={{ y: -10, boxShadow: "0px 15px 30px rgba(59, 130, 246, 0.15)" }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 opacity-50 rounded-bl-full -mt-8 -mr-8"></div>
              <svg className="h-8 w-8 text-blue-400 mb-4 opacity-30" fill="currentColor" viewBox="0 0 32 32">
                <path d="M10 8c-2.209 0-4 1.791-4 4v10c0 2.209 1.791 4 4 4h12c2.209 0 4-1.791 4-4v-10c0-2.209-1.791-4-4-4h-12zM10 10h12c1.105 0 2 0.895 2 2v10c0 1.105-0.895 2-2 2h-12c-1.105 0-2-0.895-2-2v-10c0-1.105 0.895-2 2-2zM15.398 14.5c0.361 0.45 0.602 1.023 0.602 1.75 0 1.381-1.119 2.5-2.5 2.5s-2.5-1.119-2.5-2.5c0-0.727 0.241-1.3 0.602-1.75-0.365-0.43-0.602-0.977-0.602-1.75 0-1.381 1.119-2.5 2.5-2.5s2.5 1.119 2.5 2.5c0 0.773-0.237 1.32-0.602 1.75zM18.898 14.5c0.361 0.45 0.602 1.023 0.602 1.75 0 1.381-1.119 2.5-2.5 2.5s-2.5-1.119-2.5-2.5c0-0.727 0.241-1.3 0.602-1.75-0.365-0.43-0.602-0.977-0.602-1.75 0-1.381 1.119-2.5 2.5-2.5s2.5 1.119 2.5 2.5c0 0.773-0.237 1.32-0.602 1.75z"></path>
              </svg>
              <div className="flex items-center mb-6">
                <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-blue-200 shadow-inner">
                  <motion.div 
                    className="h-full w-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    MS
                  </motion.div>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 text-lg">Mark Smith</h4>
                  <p className="text-blue-500 text-sm font-medium">Volunteer</p>
                </div>
              </div>
              <p className="text-gray-600">"Volunteering here has opened my eyes to the food insecurity in our community. The team is amazing and the impact is real."</p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-500 relative overflow-hidden"
              variants={fadeIn}
              whileHover={{ y: -10, boxShadow: "0px 15px 30px rgba(59, 130, 246, 0.15)" }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 opacity-50 rounded-bl-full -mt-8 -mr-8"></div>
              <svg className="h-8 w-8 text-blue-400 mb-4 opacity-30" fill="currentColor" viewBox="0 0 32 32">
                <path d="M10 8c-2.209 0-4 1.791-4 4v10c0 2.209 1.791 4 4 4h12c2.209 0 4-1.791 4-4v-10c0-2.209-1.791-4-4-4h-12zM10 10h12c1.105 0 2 0.895 2 2v10c0 1.105-0.895 2-2 2h-12c-1.105 0-2-0.895-2-2v-10c0-1.105 0.895-2 2-2zM15.398 14.5c0.361 0.45 0.602 1.023 0.602 1.75 0 1.381-1.119 2.5-2.5 2.5s-2.5-1.119-2.5-2.5c0-0.727 0.241-1.3 0.602-1.75-0.365-0.43-0.602-0.977-0.602-1.75 0-1.381 1.119-2.5 2.5-2.5s2.5 1.119 2.5 2.5c0 0.773-0.237 1.32-0.602 1.75zM18.898 14.5c0.361 0.45 0.602 1.023 0.602 1.75 0 1.381-1.119 2.5-2.5 2.5s-2.5-1.119-2.5-2.5c0-0.727 0.241-1.3 0.602-1.75-0.365-0.43-0.602-0.977-0.602-1.75 0-1.381 1.119-2.5 2.5-2.5s2.5 1.119 2.5 2.5c0 0.773-0.237 1.32-0.602 1.75z"></path>
              </svg>
              <div className="flex items-center mb-6">
                <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-blue-200 shadow-inner">
                  <motion.div 
                    className="h-full w-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    AJ
                  </motion.div>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 text-lg">Aisha Johnson</h4>
                  <p className="text-blue-500 text-sm font-medium">Corporate Partner</p>
                </div>
              </div>
              <p className="text-gray-600">"Our company's partnership with this food donation initiative has been incredible. The team is professional and truly dedicated."</p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}