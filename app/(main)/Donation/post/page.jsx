"use client";
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { UserDetailContext } from '@/context/UserDetailContext';
import { 
  FacebookShareButton, TwitterShareButton, WhatsappShareButton, 
  EmailShareButton, LinkedinShareButton, TelegramShareButton,
  FacebookIcon, TwitterIcon, WhatsappIcon, 
  EmailIcon, LinkedinIcon, TelegramIcon
} from 'react-share';
import CommentCountBadge from './components/CommentCountBadge';
import CommentSection from './components/CommentSection';

function PostPage() {  const { userDetail } = useContext(UserDetailContext);
  const posts = useQuery(api.posts.getAllPosts);
  const createPost = useMutation(api.posts.createPost);
  const likePost = useMutation(api.posts.likePost);
  const deletePost = useMutation(api.posts.deletePost);
  
  // Get the posts liked by the current user - always call useQuery but with skip parameter
  // This ensures hook order remains consistent between renders
  const userLikes = useQuery(api.posts.getUserLikes, 
    userDetail ? { userId: userDetail.uid } : { skip: true }
  );
  
  // Comment-related mutations and queries
  const addComment = useMutation(api.comments.addComment);
  const deleteComment = useMutation(api.comments.deleteComment);
  
  // State for comments
  const [commentText, setCommentText] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    // Function to get current URL for sharing (safe for SSR) with post ID
  const getShareUrl = (postId) => {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://your-deployed-site.com';
    
    return `${baseUrl}/Donation/post?id=${postId}`;
  };
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    category: '',
    location: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [imageError, setImageError] = useState("");
  const [lastCreatedPostId, setLastCreatedPostId] = useState(null);
    // State for fullscreen image modal
  const [modalImage, setModalImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
    // State for share dropdown
  const [shareDropdownVisible, setShareDropdownVisible] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const shareDropdownRef = useRef(null);
  
  // Refs for post elements to scroll to
  const postRefs = useRef({});
  
  // Function to open image in modal
  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl);
    setShowModal(true);
    setZoomLevel(1); // Reset zoom level when opening a new image
  };
  
  // Function to close modal
  const closeImageModal = () => {
    setShowModal(false);
    setModalImage(null);
    setZoomLevel(1); // Reset zoom level when closing modal
  };
    // Function to handle zoom in
  const zoomIn = (e) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 0.25, 3)); // Max zoom 300%
  };
  
  // Function to handle zoom out
  const zoomOut = (e) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5)); // Min zoom 50%
  };
  
  // Function to reset zoom
  const resetZoom = (e) => {
    e.stopPropagation();
    setZoomLevel(1);
  };
  
  // Handle keyboard shortcuts for zoom
  useEffect(() => {
    const handleZoomKeyboard = (e) => {
      if (showModal) {
        if (e.key === '=' || e.key === '+' || (e.key === '=' && e.shiftKey)) {
          e.preventDefault();
          zoomIn(e);
        } else if (e.key === '-' || (e.key === '-' && e.shiftKey)) {
          e.preventDefault();
          zoomOut(e);
        } else if (e.key === '0') {
          e.preventDefault();
          resetZoom(e);
        }
      }
    };
    
    window.addEventListener('keydown', handleZoomKeyboard);
    return () => window.removeEventListener('keydown', handleZoomKeyboard);
  }, [showModal, zoomLevel]);
  // Keyboard handler for modal (Escape key to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showModal) {
        closeImageModal();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  // Function to check if image is too large
  const checkImageSize = (file) => {
    const maxSizeMB = 5; // Max initial size before compression attempt
    const fileSizeMB = file.size / (1024 * 1024);
    
    if (fileSizeMB > maxSizeMB) {
      return {
        valid: false,
        message: `Image is too large (${fileSizeMB.toFixed(1)} MB). Please select an image smaller than ${maxSizeMB} MB.`
      };
    }
    
    return { valid: true };
  };
  
  // Handler for input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Function to compress image
  const compressImage = (file, maxSizeInMB = 0.85) => { // Reduced to 0.85MB for safety margin
    // Check the initial file size
    const fileSizeMB = file.size / (1024 * 1024);
    console.log(`Original image size: ${fileSizeMB.toFixed(2)} MB`);
    
    if (fileSizeMB > 5) {
      // Warn about very large files before processing
      console.warn(`Image is very large (${fileSizeMB.toFixed(2)} MB). Compression may take time.`);
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions to maintain aspect ratio
          const maxDimension = 800; // Limit max dimension to 800px
          if (width > height && width > maxDimension) {
            height = Math.round(height * maxDimension / width);
            width = maxDimension;
          } else if (height > width && height > maxDimension) {
            width = Math.round(width * maxDimension / height);
            height = maxDimension;
          } else if (width > maxDimension) {
            width = height = maxDimension;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
            // Try different quality levels until we get below the size limit
          let quality = 0.7; // Start with 70% quality
          let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          let sizeInMB = compressedDataUrl.length / (1024 * 1024);
          
          console.log(`Initial compression (quality ${quality}): ${sizeInMB.toFixed(2)} MB`);
          
          // If still too large, try progressively lower quality settings
          if (sizeInMB > maxSizeInMB) {
            // Try quality 0.5 (50%)
            quality = 0.5;
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            sizeInMB = compressedDataUrl.length / (1024 * 1024);
            console.log(`Second compression (quality ${quality}): ${sizeInMB.toFixed(2)} MB`);
            
            // If still too large, try quality 0.3 (30%)
            if (sizeInMB > maxSizeInMB) {
              quality = 0.3;
              compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
              sizeInMB = compressedDataUrl.length / (1024 * 1024);
              console.log(`Third compression (quality ${quality}): ${sizeInMB.toFixed(2)} MB`);
            }
          }
            // Validate the data URL format before returning
          if (!compressedDataUrl || !compressedDataUrl.startsWith('data:image/')) {
            console.error("Invalid image data URL format");
            reject(new Error("Failed to create a valid image data URL"));
            return;
          }
          
          // Return the best compression we could achieve
          resolve(compressedDataUrl);
        };
        
        img.onerror = (error) => {
          reject(error);
        };
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };
  // Handler for image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setImageProcessing(true);
        setImageError("");
        
        // Check file type
        if (!file.type.startsWith('image/')) {
          setImageError("Please select a valid image file (JPEG, PNG, etc.)");
          return;
        }

        // Check image size before compression
        const sizeCheck = checkImageSize(file);
        if (!sizeCheck.valid) {
          setImageError(sizeCheck.message);
          return;
        }
        
        // Preview the original image
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);

        // Compress image for upload
        console.log("Compressing image...");
        const compressedImage = await compressImage(file);
        console.log("Image compression complete");
        
        // Validate the compressed image URL
        if (!compressedImage || !compressedImage.startsWith('data:image/')) {
          throw new Error("Failed to generate a valid image URL");
        }
        
        // Update form data with compressed image
        setFormData({
          ...formData,
          imageUrl: compressedImage
        });
        
        // Check final size
        const finalSizeMB = compressedImage.length / (1024 * 1024);
        if (finalSizeMB > 0.95) {
          setImageError(`Warning: Image is still ${finalSizeMB.toFixed(2)} MB after compression (limit is 0.95 MB). You may proceed, but you'll be asked to post without the image.`);
        } else {
          setImageError("");
        }
        
      } catch (error) {
        console.error("Error compressing image:", error);
        setPreviewImage(null);
        setImageError("There was an error processing your image. Please try a smaller image or a different format.");
        setFormData({
          ...formData,
          imageUrl: '' // Clear the image URL on error
        });
      } finally {
        setImageProcessing(false);
      }
    }
  };

  // Handler for post submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userDetail) {
      alert('Please log in to create a post');
      return;
    }
    
    setIsSubmitting(true);
    try {      // Check if the image URL is too large - Convex has a 1MB limit for string fields
      let imageToUse = undefined;
      let skipImageWarning = false;      
      
      // Make sure formData.imageUrl is valid and not empty
      if (formData.imageUrl && formData.imageUrl.trim() !== '') {
        // Validate that imageUrl starts with the expected data:image/ prefix
        if (!formData.imageUrl.startsWith('data:image/')) {
          console.error("Invalid image URL format - must start with 'data:image/'");
          alert("There's an issue with the image format. Please try uploading again.");
          setIsSubmitting(false);
          return;
        }

        const sizeInMB = formData.imageUrl.length / (1024 * 1024);
        console.log(`Compressed image size: ${sizeInMB.toFixed(2)} MB`);
        
        // Convex has a 1MB limit, but we're being cautious with a 0.95MB limit
        if (sizeInMB > 0.95) {
          // Image is still too large even after compression
          if (confirm(`The image size (${sizeInMB.toFixed(2)} MB) exceeds our limit of 0.95 MB. \n\nWould you like to post without the image? \n\nTry using a smaller image or one with fewer details if you want to include an image.`)) {
            // User chose to proceed without the image
            skipImageWarning = true;
            imageToUse = undefined; // Explicitly set to undefined (rather than just not setting it)
          } else {
            // User chose to cancel - allow them to try again with a smaller image
            setIsSubmitting(false);
            return;
          }
        } else {
          imageToUse = formData.imageUrl;
          console.log(`Image accepted at ${sizeInMB.toFixed(2)} MB (below 0.95 MB limit)`);
        }
      } else {
        console.log("No image URL provided or empty URL");
      }
        console.log("Submitting post with image URL:", imageToUse ? "present" : "not present");
      
      // Call the Convex mutation to create post
      const newPostId = await createPost({
        title: formData.title,
        content: formData.content,
        imageUrl: imageToUse, // This will be undefined if no image or too large
        userId: userDetail.uid,
        userName: userDetail.name,
        userPicture: userDetail.picture || undefined,
        category: formData.category || undefined,
        location: formData.location || undefined,
      });
      
      console.log("Post created with ID:", newPostId);
      
      // Store the ID of the newly created post for animation
      setLastCreatedPostId(newPostId);
      
      // Set a timer to clear the highlight after animation
      setTimeout(() => {
        setLastCreatedPostId(null);
      }, 5000);

      // Clear form after successful submission
      setFormData({
        title: '',
        content: '',
        imageUrl: '',
        category: '',
        location: '',
      });
      setPreviewImage(null);
      setImageError("");
      
      alert('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  // Handler for liking a post
  const handleLikePost = async (postId) => {    
    if (!userDetail) {
      alert('Please log in to like posts');
      return;
    }
    
    try {
      await likePost({ 
        id: postId,
        userId: userDetail.uid
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };
  
  // Toggle share dropdown and set active post
  const toggleShareDropdown = (postId) => {
    setActivePostId(postId);
    setShareDropdownVisible(prev => !prev);
  };
    // Close share dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(event.target)) {
        setShareDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle URL query parameters for direct linking to posts
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    // Get post ID from URL query parameter
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');
    
    // If we have a post ID and posts are loaded
    if (postId && posts && posts.length > 0) {
      // Find the referenced post
      const foundPost = posts.find(p => p._id === postId);
      
      if (foundPost && postRefs.current[postId]) {
        // Scroll to the post with a slight delay to ensure the DOM is ready
        setTimeout(() => {
          postRefs.current[postId].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
          
          // Highlight the post briefly
          postRefs.current[postId].classList.add('bg-green-50');
          setTimeout(() => {
            postRefs.current[postId].classList.remove('bg-green-50');
          }, 3000);
        }, 500);
      }
    }
  }, [posts]);
    // Handler for deleting a post
  const handleDeletePost = async (postId) => {
    if (!userDetail) {
      alert('Please log in to delete posts');
      return;
    }
    
    try {
      if (confirm('Are you sure you want to delete this post?')) {
        await deletePost({ 
          id: postId,
          userId: userDetail.uid 
        });
        alert('Post deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post: ' + error.message);
    }
  };
  
  // Handler for toggling comments visibility for a post
  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    setActiveCommentPostId(postId);
  };
  
  // Handler for submitting a comment
  const handleCommentSubmit = async (postId) => {
    if (!userDetail) {
      alert('Please log in to comment');
      return;
    }
    
    if (!commentText.trim()) {
      return; // Don't submit empty comments
    }
    
    try {
      setIsSubmittingComment(true);
      await addComment({
        postId,
        userId: userDetail.uid,
        userName: userDetail.name,
        userPicture: userDetail.picture || undefined,
        content: commentText.trim()
      });
      
      // Clear comment input after submission
      setCommentText('');
      
      // Make sure comments are shown after adding one
      setShowComments(prev => ({
        ...prev,
        [postId]: true
      }));
      
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment: ' + error.message);
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  // Handler for deleting a comment
  const handleDeleteComment = async (commentId) => {
    if (!userDetail) {
      alert('Please log in to delete comments');
      return;
    }
    
    try {
      if (confirm('Are you sure you want to delete this comment?')) {
        await deleteComment({
          id: commentId,
          userId: userDetail.uid
        });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl bg-gray-50">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-green-600 to-blue-500 bg-clip-text text-transparent">Food Donation Community</h1>
      
      {/* Create Post Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Share Your Food Donation
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
              placeholder="What are you donating today?"
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
              placeholder="Share details about your food donation... What is it? How much food? Is packaging required?"
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
              >
                <option value="">Select a category</option>
                <option value="cooked">Cooked Food</option>
                <option value="fruits">Fruits & Vegetables</option>
                <option value="grains">Grains & Rice</option>
                <option value="dairy">Dairy Products</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                placeholder="Enter your location"
              />
            </div>
          </div>
            <div>            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image <span className="text-xs text-gray-500">(Max size: 0.95MB)</span>
            </label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-400 transition-colors">
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={imageProcessing}
              />
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-1 text-sm text-gray-600">Drag and drop an image, or <span className="text-green-500 font-medium">browse</span></p>
                <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 0.95MB</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Images will be automatically compressed. Very large or detailed images may not upload properly.
            </p>
            
            {imageProcessing && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-600"></div>
                <span>Processing image...</span>
              </div>
            )}
            
            {imageError && (
              <div className="mt-2 text-sm text-red-600">
                {imageError}
              </div>
            )}
              {previewImage && !imageProcessing && (
              <div className="mt-3 border border-gray-200 rounded-md p-2">
                <div className="relative group">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="h-48 w-full object-cover rounded-md cursor-pointer" 
                    onClick={() => openImageModal(previewImage)}
                    onError={(e) => {
                      console.error('Preview image failed to load');
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x400?text=Preview+Image';
                    }}
                  />
                  {/* Zoom indicator */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">Preview of your uploaded image</p>
                  <button 
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setFormData({...formData, imageUrl: ''});
                      setImageError('');
                    }}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove image
                  </button>
                </div>
              </div>
            )}
          </div>
            <Button 
            type="submit" 
            disabled={isSubmitting || !userDetail}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all transform hover:scale-[1.02] font-medium text-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Share Donation
              </>
            )}
          </Button>
          {!userDetail && (
            <p className="text-sm text-red-600 text-center mt-2">
              Please log in to create a post
            </p>
          )}
        </form>
      </div>
        {/* Posts Feed */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b pb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Recent Donations
        </h2>
        
        {posts ? (
          posts.length > 0 ? (
            posts.map((post) => (              <div 
                key={post._id}
                ref={el => postRefs.current[post._id] = el}
                className={`bg-white rounded-xl shadow-md p-6 mb-6 hover:shadow-lg transition-shadow border border-gray-100 ${post._id === lastCreatedPostId ? 'animate-fade-in' : ''}`}
              ><div className="flex items-center mb-4 cursor-pointer">
                  {post.userPicture ? (
                    <img 
                      src={post.userPicture} 
                      alt={post.userName} 
                      className="h-12 w-12 rounded-full mr-3 object-cover ring-2 ring-green-100 p-0.5"
                      onError={(e) => {
                        e.target.onerror = null;
                        // Replace with a div containing user's initial when image fails to load
                        const parent = e.target.parentElement;
                        if (parent) {
                          const initialDiv = document.createElement('div');
                          initialDiv.className = "h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3";
                          initialDiv.innerHTML = `<span class="text-lg text-gray-600">${post.userName?.charAt(0) || '?'}</span>`;
                          parent.replaceChild(initialDiv, e.target);
                        }
                      }}
                    />                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center mr-3 text-white font-bold ring-2 ring-green-100 p-0.5">
                      <span className="text-lg">{post.userName?.charAt(0) || '?'}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-base hover:underline">{post.userName || 'Anonymous'}</h3>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      {post.location && (
                        <>
                          <span className="text-gray-400">•</span>
                          <p className="text-xs text-gray-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {post.location}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {post.category && (
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                  )}
                </div>
                  <h2 className="text-xl font-bold mb-2 text-gray-800">{post.title}</h2>
                <p className="mb-5 text-gray-700 leading-relaxed">{post.content}</p>                {post.imageUrl ? (
                  <div className="mb-5 relative h-80 w-full overflow-hidden rounded-xl group shadow-sm">
                    {/* Loading placeholder */}
                    <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center z-0">
                      <svg className="w-12 h-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    
                    {/* Zoom icon indicator */}
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-2 rounded-lg z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                      {/* Actual image */}                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="rounded-xl w-full h-full object-cover relative z-10 cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:brightness-95"
                      loading="lazy"
                      onClick={() => openImageModal(post.imageUrl)}
                      onLoad={(e) => {
                        // Remove placeholder animation when image loads
                        if (e.target.parentElement) {
                          const placeholder = e.target.parentElement.querySelector('.animate-pulse');
                          if (placeholder) placeholder.classList.add('hidden');
                        }
                      }}
                      onError={(e) => {
                        console.error('Image failed to load:', post.imageUrl?.substring(0, 50) + '...');
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/600x400?text=Food+Donation+Image';
                        // Show placeholder with error message
                        if (e.target.parentElement) {
                          const placeholder = e.target.parentElement.querySelector('.animate-pulse');
                          if (placeholder) {
                            placeholder.classList.remove('animate-pulse');
                            placeholder.querySelector('span').textContent = 'Image could not be loaded';
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  /* No image attached to this post */
                  <div className="mb-4 h-12"></div>
                )}
                  <div className="mt-5 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">                      <button 
                        onClick={() => handleLikePost(post._id)} 
                        className={`flex items-center space-x-2 transition-colors group ${userLikes && userLikes[post._id] ? 'text-green-600' : 'text-gray-700 hover:text-green-600'}`}
                      >
                        <div className={`p-2 rounded-full transition-colors ${userLikes && userLikes[post._id] ? 'bg-green-50' : 'bg-gray-50 group-hover:bg-green-50'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={userLikes && userLikes[post._id] ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905v.714L7.5 9h-3a2 2 0 00-2 2v.5" />
                          </svg>
                        </div>
                        <span className="font-medium">{post.likes || 0}</span>
                      </button><button 
                        onClick={() => toggleComments(post._id)} 
                        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors group"
                      >
                        <div className="p-2 rounded-full bg-gray-50 group-hover:bg-blue-50 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>                        <span className="font-medium">
                          Comments 
                          <CommentCountBadge postId={post._id} />
                        </span>
                      </button><div className="relative">
                        <button 
                          onClick={() => toggleShareDropdown(post._id)}
                          className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors group"
                        >
                          <div className="p-2 rounded-full bg-gray-50 group-hover:bg-orange-50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          </div>
                          <span className="font-medium">Share</span>
                        </button>
                        
                        {shareDropdownVisible && activePostId === post._id && (
                          <div                            ref={shareDropdownRef}
                            className="absolute bottom-12 left-0 bg-white shadow-lg rounded-lg p-3 z-10 border border-gray-100 min-w-60 animate-fade-in-up transition-all"
                          >
                            <h4 className="text-sm font-medium mb-2 text-gray-700">Share this donation</h4>                            <div className="grid grid-cols-3 gap-2">                              <FacebookShareButton url={getShareUrl(post._id)} quote={`Check out this food donation: ${post.title}`}>
                                <FacebookIcon size={36} round />
                              </FacebookShareButton>
                              
                              <TwitterShareButton url={getShareUrl(post._id)} title={`Check out this food donation: ${post.title}`}>
                                <TwitterIcon size={36} round />
                              </TwitterShareButton>
                              
                              <WhatsappShareButton url={getShareUrl(post._id)} title={`Check out this food donation: ${post.title}`}>
                                <WhatsappIcon size={36} round />
                              </WhatsappShareButton>
                              
                              <LinkedinShareButton url={getShareUrl(post._id)} title={`Food Donation: ${post.title}`} summary={post.content}>
                                <LinkedinIcon size={36} round />
                              </LinkedinShareButton>
                              
                              <TelegramShareButton url={getShareUrl(post._id)} title={`Food Donation: ${post.title}`}>
                                <TelegramIcon size={36} round />
                              </TelegramShareButton>
                              
                              <EmailShareButton url={getShareUrl(post._id)} subject={`Food Donation: ${post.title}`} body={post.content}>
                                <EmailIcon size={36} round />
                              </EmailShareButton>
                            </div>
                            
                            {/* Copy link option */}
                            <div className="mt-3 pt-2 border-t border-gray-100">
                              <button
                                onClick={() => {
                                  const url = getShareUrl(post._id);
                                  navigator.clipboard.writeText(url)
                                    .then(() => {
                                      alert('Link copied to clipboard');
                                      setShareDropdownVisible(false);
                                    })
                                    .catch(err => {
                                      console.error('Failed to copy link:', err);
                                      alert('Failed to copy link');
                                    });
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                                Copy Direct Link
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                      {userDetail && post.userId === userDetail.uid && (
                      <button 
                        onClick={() => handleDeletePost(post._id)} 
                        className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
                        title="Delete your post"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}                  </div>
                </div>
                  {/* Comments Section */}
                {showComments[post._id] && (
                  <CommentSection 
                    post={post}
                    userDetail={userDetail}
                    commentText={commentText}
                    setCommentText={setCommentText}
                    isSubmittingComment={isSubmittingComment}
                    activeCommentPostId={activeCommentPostId}
                    handleCommentSubmit={handleCommentSubmit}
                    handleDeleteComment={handleDeleteComment}
                  />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No posts yet. Be the first to share a food donation!</p>
            </div>
          )
        ) : (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600"></div>
          </div>
        )}
      </div>      {/* Fullscreen Image Modal */}
      {showModal && modalImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal} // Close when clicking outside
        >          <div 
            className="relative max-w-4xl max-h-[90vh] overflow-hidden bg-gray-800 rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the modal itself
          ><img 
              src={modalImage} 
              alt="Full-size image" 
              className="max-w-full max-h-[80vh] rounded-lg object-contain bg-white transition-transform duration-200"
              style={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                cursor: zoomLevel > 1 ? 'move' : 'default'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/800x600?text=Image+Could+Not+Be+Loaded';
              }}
            />
            <button 
              onClick={closeImageModal} 
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white w-8 h-8 rounded-full flex items-center justify-center text-xl hover:bg-opacity-70 transition-all"
              aria-label="Close image preview"
            >
              ×
            </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-3 text-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={zoomIn} 
                    className="p-2 bg-white text-black rounded-md hover:bg-gray-200 transition flex items-center"
                    aria-label="Zoom In"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  <button 
                    onClick={zoomOut} 
                    className="p-2 bg-white text-black rounded-md hover:bg-gray-200 transition flex items-center"
                    aria-label="Zoom Out"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                    </svg>
                  </button>
                  <button 
                    onClick={resetZoom} 
                    className="p-2 bg-white text-black rounded-md hover:bg-gray-200 transition flex items-center"
                    aria-label="Reset Zoom"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <span className="ml-2 bg-black bg-opacity-60 px-2 py-1 rounded">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                </div>
                <div>
                  Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">+</kbd> to zoom in, 
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs ml-1">-</kbd> to zoom out,
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs ml-1">0</kbd> to reset zoom,
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs ml-1">ESC</kbd> to close
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostPage;