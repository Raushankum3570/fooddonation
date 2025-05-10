import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateUser = mutation({
  args: {
      name: v.string(),
      email: v.string(),
      picture: v.string(),
      uid: v.string(),
      role: v.string(),
  },
  handler: async (ctx, args) => {
      console.log('Creating user with args:', args); // Add this line
      const user = await ctx.db.query('users')
          .filter((q) => q.eq(q.field('email'), args.email))
          .collect();
      console.log(user);
      if (user.length === 0) {
          const result = await ctx.db.insert('users', {
              name: args.name,
              email: args.email,
              picture: args.picture,
              uid: args.uid,
              role: args.role,
          });
          console.log(result);
      }
  },
});
export const GetUser = query({
    args: {
        email: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        if (!args.email) {
            // Handle case when no email is provided
            return null; // or return all users, etc.
        }
        const user = await ctx.db.query('users')
            .filter((q) => q.eq(q.field('email'), args.email))
            .collect();
        return user[0];
    }
});

export const getAllUsers = query({
    handler: async (ctx) => {
      // Fetch all users from the database
      const users = await ctx.db.query("users").collect();
      return users;
    },
  });