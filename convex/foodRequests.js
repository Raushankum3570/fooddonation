// File: convex/foodRequests.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Simplified version to minimize potential errors
export const createFoodRequest = mutation({
  args: {
    name: v.string(),
    contact: v.string(),
    location: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    foodDescription: v.string(),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    console.log("Received request data:", args);
    
    // Insert the data with additional fields
    const id = await ctx.db.insert("foodRequests", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
    
    console.log("Inserted document with ID:", id);
    return id;
  },
});

export const getAllFoodRequests = query({
  handler: async (ctx) => {
    // Fetch all food requests from the database
    const requests = await ctx.db.query("foodRequests").collect();
    return requests;
  },
});