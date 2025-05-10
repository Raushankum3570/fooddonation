import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createMoneyDonation = mutation({
  args: {
    donorName: v.string(),
    donationAmount: v.number(),
    transactionId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("moneyDonations", args);
  },
});
export const getAllMoneyDonations = query({
  handler: async (ctx) => {
    // Fetch all money donations from the database
    const donations = await ctx.db.query("moneyDonations").collect();
    return donations;
  },
});