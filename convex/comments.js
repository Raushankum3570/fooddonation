// File: convex/comments.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add a new comment to a post
export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.string(),
    userName: v.string(),
    userPicture: v.optional(v.string()),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if the post exists
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    
    // Create the comment
    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      userId: args.userId,
      userName: args.userName,
      userPicture: args.userPicture,
      content: args.content,
      createdAt: Date.now(),
    });
    
    return commentId;
  },
});

// Get all comments for a post, ordered by most recent
export const getCommentsByPostId = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("postId"), args.postId))
      .order("desc", (q) => q.createdAt)
      .collect();
    
    return comments;
  },
});

// Delete a comment (only by the author of the comment)
export const deleteComment = mutation({
  args: { id: v.id("comments"), userId: v.string() },
  handler: async (ctx, args) => {
    // Check if comment exists and belongs to the user
    const comment = await ctx.db.get(args.id);
    
    if (!comment) {
      throw new Error("Comment not found");
    }
    
    if (comment.userId !== args.userId) {
      throw new Error("You can only delete your own comments");
    }
    
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
