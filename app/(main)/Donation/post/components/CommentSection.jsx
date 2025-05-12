"use client";
import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

// This component handles the complete comment section, properly using hooks
function CommentSection({ 
  post,
  userDetail,
  commentText,
  setCommentText,
  isSubmittingComment,
  activeCommentPostId,
  handleCommentSubmit,
  handleDeleteComment
}) {
  // Use the hook at the component level (not inside conditional rendering)
  const comments = useQuery(api.comments.getCommentsByPostId, { postId: post._id });
  
  return (
    <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in-up">
      <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Comments
      </h4>
      
      {/* Comment List */}
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
      
      {/* Comment Form */}
      {userDetail ? (
        <div className="mt-3 flex items-start gap-2">
          {userDetail.picture ? (
            <img 
              src={userDetail.picture} 
              alt={userDetail.name} 
              className="h-8 w-8 rounded-full object-cover flex-shrink-0 mt-1"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 mt-1">
              {userDetail.name?.charAt(0) || '?'}
            </div>
          )}
          <div className="flex-grow">
            <div className="relative">
              <textarea
                value={activeCommentPostId === post._id ? commentText : ''}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  // Submit comment when pressing Ctrl+Enter or Cmd+Enter
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    if (commentText.trim()) {
                      handleCommentSubmit(post._id);
                    }
                  }
                }}
                placeholder="Add a comment... (Ctrl+Enter to send)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none min-h-[60px] resize-none text-sm"
                disabled={isSubmittingComment}
              />
              <button 
                onClick={() => handleCommentSubmit(post._id)}
                disabled={isSubmittingComment || !commentText.trim()}
                className={`absolute right-2 bottom-2 p-1.5 rounded-full ${
                  commentText.trim() ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                } transition-colors`}
              >
                {isSubmittingComment ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-center mt-3 text-gray-500">
          Please <span className="text-blue-600 font-medium">log in</span> to comment
        </p>
      )}
    </div>
  );
}

export default CommentSection;
