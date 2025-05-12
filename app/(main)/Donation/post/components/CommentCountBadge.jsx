"use client";
import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

// This component properly encapsulates the useQuery hook
function CommentCountBadge({ postId }) {
  const commentCount = useQuery(api.commentCount.getCommentCount, { postId });
  
  if (!commentCount || commentCount === 0) {
    return null;
  }
  
  return (
    <span className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-600 bg-blue-100 rounded-full">
      {commentCount}
    </span>
  );
}

export default CommentCountBadge;
