// File: convex/commentCount.js
import { query } from "./_generated/server";
import { v } from "convex/values";

// Function to get the number of comments for a post
export const getCommentCount = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    // Using collect() and checking the length instead of count()
    const comments = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("postId"), args.postId))
      .collect();
    
    return comments.length;
  },
});
