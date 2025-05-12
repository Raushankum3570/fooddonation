"use client";
import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

// This component handles rendering the comment list in a way that properly follows React hooks rules
function CommentList({ postId, userDetail, handleDeleteComment }) {
  const comments = useQuery(api.comments.getCommentsByPostId, { postId });
  
  return (
    <>
      {comments?.map((comment) => (
        <div key={comment._id} className="mb-3 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              {comment.userPicture ? (
                <img 
                  src={comment.userPicture} 
                  alt={comment.userName} 
                  className="h-7 w-7 rounded-full mr-2 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}&background=random`;
                  }}
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 text-xs font-medium">
                  {comment.userName?.charAt(0) || '?'}
                </div>
              )}
              <div>
                <div className="font-medium text-sm">{comment.userName}</div>
                <div className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
            
            {userDetail && comment.userId === userDetail.uid && (
              <button 
                onClick={() => handleDeleteComment(comment._id)}
                className="text-gray-400 hover:text-red-600 p-1"
                title="Delete comment"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="text-sm text-gray-700 pl-9">{comment.content}</div>
        </div>
      ))}
    </>
  );
}

export default CommentList;
