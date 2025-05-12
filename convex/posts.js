// File: convex/posts.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new food donation post
export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    imageUrl: v.optional(v.string()),
    userId: v.string(),
    userName: v.string(),
    userPicture: v.optional(v.string()),
    category: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate the imageUrl if it exists
    if (args.imageUrl !== undefined) {
      // Check if imageUrl is empty string which can cause issues
      if (args.imageUrl === '') {
        args.imageUrl = undefined;
      } else if (!args.imageUrl.startsWith('data:image/')) {
        console.warn("Invalid image URL format received:", args.imageUrl?.substring(0, 20) + '...');
      }
    }
    
    const postId = await ctx.db.insert("posts", {
      ...args,
      likes: 0,
      createdAt: Date.now(),
    });
    
    return postId;
  },
});

// Get all posts, ordered by most recent
export const getAllPosts = query({
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .order("desc", (q) => q.createdAt)
      .collect();
    
    return posts;
  },
});

// Get posts by a specific user
export const getPostsByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc", (q) => q.createdAt)
      .collect();
    
    return posts;
  },
});

// Get a single post by ID
export const getPostById = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    return post;
  },
});

// Like a post - toggle like/unlike for a specific user on a post
export const likePost = mutation({
  args: { 
    id: v.id("posts"),
    userId: v.string()
  },
  handler: async (ctx, args) => {
    // Check if post exists
    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new Error("Post not found");
    }
    
    // Check if user already liked this post
    const existingLike = await ctx.db
      .query("likes")
      .filter((q) => q.and(
        q.eq(q.field("userId"), args.userId),
        q.eq(q.field("postId"), args.id)
      ))
      .first();
    
    // Toggle like/unlike based on existence
    if (existingLike) {
      // User already liked this post, so unlike it
      await ctx.db.delete(existingLike._id);
      
      // Decrement the likes count
      await ctx.db.patch(args.id, {
        likes: Math.max(0, (post.likes || 1) - 1), // Prevent negative likes
      });
      
      return { success: true, liked: false };
    } else {
      // User hasn't liked this post yet, so like it
      await ctx.db.insert("likes", {
        userId: args.userId,
        postId: args.id,
        createdAt: Date.now(),
      });
      
      // Increment the likes count
      await ctx.db.patch(args.id, {
        likes: (post.likes || 0) + 1,
      });
      
      return { success: true, liked: true };
    }
  },
});

// Delete a post
export const deletePost = mutation({
  args: { id: v.id("posts"), userId: v.string() },
  handler: async (ctx, args) => {
    // First check if the post exists and belongs to the user
    const post = await ctx.db.get(args.id);
    
    if (!post) {
      throw new Error("Post not found");
    }
    
    if (post.userId !== args.userId) {
      throw new Error("You can only delete your own posts");
    }
    
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Get all posts liked by a specific user
export const getUserLikes = query({
  args: { 
    userId: v.optional(v.string()),
    skip: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    // If skip is true or userId is not provided, return empty object
    if (args.skip || !args.userId) {
      return {};
    }
    
    // Fetch all likes by this user
    const likes = await ctx.db
      .query("likes")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    
    // Create a map for easy lookup
    const likedPostsMap = {};
    likes.forEach(like => {
      likedPostsMap[like.postId] = true;
    });
    
    return likedPostsMap;
  }
});
