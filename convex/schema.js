import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        picture: v.string(),
        uid: v.string(),
        role: v.optional(v.string())
    }),
    donations: defineTable({
        foodName: v.string(),
        description: v.string(),
        imageUrl: v.string(),
        quantity: v.optional(v.number()),
        expiryDate: v.optional(v.string()),
        location: v.optional(v.string()),
        contactPhone: v.optional(v.string()),
        category: v.optional(v.string()),
        userId: v.optional(v.string()), // This needs to remain optional
        status: v.optional(v.string()), // "available", "claimed", "completed"
        createdAt: v.number(), // storing Date.now() as a number
    }),
    moneyDonations: defineTable({
        donorName: v.string(),
        donationAmount: v.number(),
        transactionId: v.optional(v.string())
    }),
    // Table for food requests
    foodRequests: defineTable({
        name: v.string(),
        contact: v.string(),
        location: v.string(),
        foodDescription: v.string(),
        quantity: v.number(),
        status: v.optional(v.string()), // "pending", "approved", "fulfilled", etc.
        createdAt: v.number(),
    })
});