import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// This function will add a new donation to your Convex database
export const addDonation = mutation({
  // Define the arguments this function accepts
  args: {
    foodName: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    quantity: v.optional(v.number()),
    expiryDate: v.optional(v.string()),
    location: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    category: v.optional(v.string()),
    userId: v.optional(v.string()),
    email: v.optional(v.string())
  },
  
  // Function implementation
  handler: async (ctx, args) => {
    // Create donation object with required fields
    const donationData = {
      foodName: args.foodName,
      description: args.description,
      imageUrl: args.imageUrl,
      quantity: args.quantity || 1,
      expiryDate: args.expiryDate || "",
      location: args.location || "",
      contactPhone: args.contactPhone || "",
      category: args.category || "Other",
      status: "available",
      createdAt: Date.now(),
    };
    
    // Only add userId if it's provided (don't set it to null)
    if (args.userId) {
      donationData.userId = args.userId;
    }
    
    // Insert the new donation document into the "donations" table
    const donationId = await ctx.db.insert("donations", donationData);
    
    return donationId;
  },
});

export const getRecentDonations = query({
  handler: async (ctx) => {
    const donations = await ctx.db
      .query("donations")
      .order("desc", "createdAt")
      .collect();
    
    return donations;
  }
});

export const getDonationsByCategory = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let query = ctx.db.query("donations");
    
    if (args.category && args.category !== "All") {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }
    
    return await query.order("desc", "createdAt").collect();
  }
});

// Get donations by location for map view
export const getDonationsByLocation = query({
  handler: async (ctx) => {
    const donations = await ctx.db
      .query("donations")
      .filter((q) => q.neq(q.field("location"), ""))
      .order("desc", "createdAt")
      .collect();
    
    return donations;
  }
});

// Get donation stats for the dashboard
export const getDonationStats = query({
  handler: async (ctx) => {
    const donations = await ctx.db.query("donations").collect();
    
    // Calculate stats
    const totalDonations = donations.length;
    
    // Calculate category counts
    const categoryCounts = donations.reduce((acc, donation) => {
      const category = donation.category || "Other";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate location-based stats
    const locationCounts = donations.reduce((acc, donation) => {
      if (donation.location) {
        acc[donation.location] = (acc[donation.location] || 0) + 1;
      }
      return acc;
    }, {});
    
    return { 
      totalDonations,
      categoryCounts,
      locationCounts,
      recentDonations: donations.slice(0, 5)
    };
  },
});

export const getUserDonations = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    
    return await ctx.db
      .query("donations")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc", "createdAt")
      .collect();
  },
});

// Get global stats for comparison
export const getGlobalStats = query({
  handler: async (ctx) => {
    const allDonations = await ctx.db.query("donations").collect();
    const allFoodRequests = await ctx.db.query("foodRequests").collect();
    const allMoneyDonations = await ctx.db.query("moneyDonations").collect();
    
    const totalDonations = allDonations.length;
    const totalMoneyAmount = allMoneyDonations.reduce(
      (total, donation) => total + donation.donationAmount, 0
    );
    
    return {
      allDonations,
      allFoodRequests,
      allMoneyDonations,
      totalDonations,
      totalMoneyAmount
    };
  },
});