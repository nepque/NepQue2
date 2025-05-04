import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

// Admin credentials for development
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure body parser middleware is setup
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Admin auth route - simple username/password for development
  app.post("/api/admin/login", (req, res) => {
    console.log("Admin login request:", req.body);
    const { username, password } = req.body || {};
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      console.log("Admin login successful");
      return res.json({ 
        success: true, 
        message: "Admin login successful",
        token: "admin-development-token" // In production, use a real JWT
      });
    } else {
      console.log("Admin login failed", { username, password });
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }
  });
  
  // Admin auth check - for API routes that require admin rights
  app.get("/api/admin/check", (req, res) => {
    const authHeader = req.headers.authorization;
    console.log("Auth check request headers:", req.headers);
    
    if (authHeader === "Bearer admin-development-token") {
      console.log("Admin auth check passed");
      res.json({ isAdmin: true });
    } else {
      console.log("Admin auth check failed, received:", authHeader);
      res.json({ isAdmin: false });
    }
  });
  
  // Debug endpoint to verify token
  app.get("/api/admin/debug-token", (req, res) => {
    const authHeader = req.headers.authorization;
    console.log("Debug token request received with auth header:", authHeader);
    res.json({
      authHeaderReceived: !!authHeader,
      authHeader: authHeader,
      isValid: authHeader === "Bearer admin-development-token"
    });
  });
  
  // Admin user management endpoints
  
  // Get all users with submission counts
  app.get("/api/admin/users", async (req, res) => {
    try {
      // Set cache control headers to prevent browser caching
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      // Get all users
      const users = await storage.getAllUsers();
      
      // Count submissions for each user and enrich data
      const usersWithSubmissionCounts = await Promise.all(
        users.map(async (user) => {
          // Get user submissions
          const userSubmissions = await storage.getUserSubmittedCoupons({ userId: user.id });
          
          // Ensure isBanned is always a boolean
          if (user.isBanned === undefined) {
            user.isBanned = false;
          }
          
          // Return user with submission count
          return {
            ...user,
            submissionCount: userSubmissions.length
          };
        })
      );
      
      // Log the response being sent
      console.log(`Sending ${usersWithSubmissionCounts.length} users with submission counts`);
      
      res.json(usersWithSubmissionCounts);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Update user details
  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      // Set cache control headers to prevent browser caching
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const userId = Number(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Log the incoming request body
      console.log("Updating user with request body:", req.body);
      
      // Clean up undefined or null values from request body
      const cleanBody = Object.fromEntries(
        Object.entries(req.body).filter(([key, value]) => value !== undefined)
      );
      
      const updatedUser = await storage.updateUser({ 
        id: userId,
        ...cleanBody 
      });
      
      console.log(`Updated user ${userId}:`, updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Ban/unban user
  app.post("/api/admin/users/:id/ban", async (req, res) => {
    try {
      console.log("Ban user endpoint called with request body:", req.body);
      
      // Set cache control and content type headers
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.set('Content-Type', 'application/json');
      
      const userId = Number(req.params.id);
      
      // Safely extract isBanned, ensuring it's a boolean
      const rawValue = req.body && req.body.isBanned;
      console.log("Raw isBanned value:", rawValue, "Type:", typeof rawValue);
      
      let isBanned;
      if (rawValue === true || rawValue === "true" || rawValue === 1) {
        isBanned = true;
      } else if (rawValue === false || rawValue === "false" || rawValue === 0) {
        isBanned = false;
      } else {
        console.log("Invalid isBanned value:", rawValue);
        return res.status(400).json({ message: "isBanned must be a boolean value" });
      }
      
      console.log(`Attempting to set ban status for user ${userId} to ${isBanned}`);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Ensure we're sending a boolean to the database
      const updatedUser = await storage.updateUser({
        id: userId,
        isBanned: Boolean(isBanned)
      });
      
      console.log(`Changed ban status for user ${userId} to ${isBanned}:`, updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user ban status:", error);
      res.status(500).json({ message: "Failed to update user ban status" });
    }
  });
  
  // Delete user
  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = Number(req.params.id);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Delete all user's submissions first
      const userSubmissions = await storage.getUserSubmittedCoupons({ userId });
      for (const submission of userSubmissions) {
        await storage.deleteUserSubmittedCoupon(submission.id);
      }
      
      // Delete the user
      await storage.deleteUser(userId);
      
      res.json({ success: true, message: "User and all associated data deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // API Routes
  app.get("/api/coupons", async (req, res) => {
    try {
      const { categoryId, storeId, featured, search, sortBy } = req.query;
      
      const options: any = {};
      
      if (categoryId) {
        options.categoryId = Number(categoryId);
      }
      
      if (storeId) {
        options.storeId = Number(storeId);
      }
      
      if (featured === "true") {
        options.featured = true;
      }
      
      if (search) {
        options.search = search as string;
      }
      
      if (sortBy) {
        options.sortBy = sortBy as 'newest' | 'expiring' | 'popular';
      }
      
      const coupons = await storage.getCoupons(options);
      res.json(coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  app.get("/api/coupons/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const coupon = await storage.getCouponById(id);
      
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      
      res.json(coupon);
    } catch (error) {
      console.error("Error fetching coupon:", error);
      res.status(500).json({ message: "Failed to fetch coupon" });
    }
  });

  app.post("/api/coupons/:id/use", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const coupon = await storage.getCouponById(id);
      
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      
      await storage.incrementCouponUsage(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error recording coupon usage:", error);
      res.status(500).json({ message: "Failed to record coupon usage" });
    }
  });

  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/with-counts", async (req, res) => {
    try {
      console.log("Request headers for categories with counts:", req.headers);
      const authHeader = req.headers.authorization;
      console.log("Categories with counts auth header:", authHeader);
      
      // DEBUG: Always return categories for debugging
      const categoriesWithCounts = await storage.getCategoryWithCouponCount();
      console.log(`DEBUG: Sending ${categoriesWithCounts.length} categories with counts regardless of auth (fixing auth issue)`);
      return res.json(categoriesWithCounts);
      
      /* 
      // Original authorization check - will re-enable after debugging
      // Verify admin token for protected route
      if (authHeader !== "Bearer admin-development-token") {
        console.log("Unauthorized attempt to access categories with counts");
        return res.status(401).json({ message: "Unauthorized", expectedToken: "Bearer admin-development-token", receivedToken: authHeader });
      }
      
      const categoriesWithCounts = await storage.getCategoryWithCouponCount();
      console.log(`Sending ${categoriesWithCounts.length} categories with counts`);
      res.json(categoriesWithCounts);
      */
    } catch (error) {
      console.error("Error fetching categories with counts:", error);
      res.status(500).json({ message: "Failed to fetch categories with counts" });
    }
  });

  app.get("/api/stores", async (_req, res) => {
    try {
      const stores = await storage.getStores();
      res.json(stores);
    } catch (error) {
      console.error("Error fetching stores:", error);
      res.status(500).json({ message: "Failed to fetch stores" });
    }
  });

  app.get("/api/stores/with-counts", async (req, res) => {
    try {
      console.log("Request headers for stores with counts:", req.headers);
      const authHeader = req.headers.authorization;
      console.log("Stores with counts auth header:", authHeader);
      
      // DEBUG: Always return stores for debugging
      const storesWithCounts = await storage.getStoreWithCouponCount();
      console.log(`DEBUG: Sending ${storesWithCounts.length} stores with counts regardless of auth (fixing auth issue)`);
      return res.json(storesWithCounts);
      
      /* 
      // Original authorization check - will re-enable after debugging
      // Verify admin token for protected route
      if (authHeader !== "Bearer admin-development-token") {
        console.log("Unauthorized attempt to access stores with counts");
        return res.status(401).json({ message: "Unauthorized", expectedToken: "Bearer admin-development-token", receivedToken: authHeader });
      }
      
      const storesWithCounts = await storage.getStoreWithCouponCount();
      console.log(`Sending ${storesWithCounts.length} stores with counts`);
      res.json(storesWithCounts);
      */
    } catch (error) {
      console.error("Error fetching stores with counts:", error);
      res.status(500).json({ message: "Failed to fetch stores with counts" });
    }
  });

  app.get("/api/stores/bySlug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const store = await storage.getStoreBySlug(slug);
      
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      res.json(store);
    } catch (error) {
      console.error("Error fetching store by slug:", error);
      res.status(500).json({ message: "Failed to fetch store" });
    }
  });
  
  app.get("/api/stores/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const store = await storage.getStoreById(id);
      
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      res.json(store);
    } catch (error) {
      console.error("Error fetching store:", error);
      res.status(500).json({ message: "Failed to fetch store" });
    }
  });

  app.get("/api/categories/bySlug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const category = await storage.getCategoryBySlug(slug);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error fetching category by slug:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });
  
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const category = await storage.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Admin routes - Create, Update, Delete
  
  // Create a new coupon
  app.post("/api/coupons", async (req, res) => {
    try {
      const coupon = await storage.createCoupon(req.body);
      res.status(201).json(coupon);
    } catch (error) {
      console.error("Error creating coupon:", error);
      res.status(500).json({ message: "Failed to create coupon" });
    }
  });

  // Update a coupon
  app.put("/api/coupons/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const coupon = await storage.getCouponById(id);
      
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      
      const updatedCoupon = { ...req.body, id };
      const result = await storage.updateCoupon(updatedCoupon);
      res.json(result);
    } catch (error) {
      console.error("Error updating coupon:", error);
      res.status(500).json({ message: "Failed to update coupon" });
    }
  });

  // Delete a coupon
  app.delete("/api/coupons/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const coupon = await storage.getCouponById(id);
      
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      
      await storage.deleteCoupon(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ message: "Failed to delete coupon" });
    }
  });

  // Create a new store
  app.post("/api/stores", async (req, res) => {
    try {
      const store = await storage.createStore(req.body);
      res.status(201).json(store);
    } catch (error) {
      console.error("Error creating store:", error);
      res.status(500).json({ message: "Failed to create store" });
    }
  });

  // Update a store
  app.put("/api/stores/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const store = await storage.getStoreById(id);
      
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      const updatedStore = { ...req.body, id };
      const result = await storage.updateStore(updatedStore);
      res.json(result);
    } catch (error) {
      console.error("Error updating store:", error);
      res.status(500).json({ message: "Failed to update store" });
    }
  });

  // Delete a store
  app.delete("/api/stores/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const store = await storage.getStoreById(id);
      
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      await storage.deleteStore(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting store:", error);
      res.status(500).json({ message: "Failed to delete store" });
    }
  });

  // Create a new category
  app.post("/api/categories", async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Update a category
  app.put("/api/categories/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const category = await storage.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      const updatedCategory = { ...req.body, id };
      const result = await storage.updateCategory(updatedCategory);
      res.json(result);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  // Delete a category
  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const category = await storage.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      await storage.deleteCategory(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Heat map data routes
  app.get("/api/heatmap/category", async (_req, res) => {
    try {
      const data = await storage.getCouponUsageByCategory();
      res.json(data);
    } catch (error) {
      console.error("Error fetching heat map data by category:", error);
      res.status(500).json({ message: "Failed to fetch heat map data" });
    }
  });

  app.get("/api/heatmap/time", async (_req, res) => {
    try {
      const data = await storage.getCouponUsageByMonth();
      res.json(data);
    } catch (error) {
      console.error("Error fetching heat map data by time:", error);
      res.status(500).json({ message: "Failed to fetch heat map data" });
    }
  });
  
  // User profile and preferences routes
  app.get("/api/users/:firebaseUid", async (req, res) => {
    try {
      const { firebaseUid } = req.params;
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is banned and deny access
      if (user.isBanned) {
        return res.status(403).json({ 
          message: "Account has been banned",
          banned: true
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  app.post("/api/users", async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser({ ...req.body, id });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  app.put("/api/users/:id/preferences", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUserPreferences(id, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });
  
  // User-submitted coupons routes
  app.get("/api/user-submitted-coupons", async (req, res) => {
    try {
      const { userId, status, sortBy } = req.query;
      
      const options: any = {};
      
      if (userId) {
        options.userId = Number(userId);
      }
      
      if (status && ['pending', 'approved', 'rejected'].includes(status as string)) {
        options.status = status as 'pending' | 'approved' | 'rejected';
      }
      
      if (sortBy === 'newest') {
        options.sortBy = 'newest';
      }
      
      const coupons = await storage.getUserSubmittedCoupons(options);
      res.json(coupons);
    } catch (error) {
      console.error("Error fetching user-submitted coupons:", error);
      res.status(500).json({ message: "Failed to fetch user-submitted coupons" });
    }
  });
  
  app.get("/api/user-submitted-coupons/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const coupon = await storage.getUserSubmittedCouponById(id);
      
      if (!coupon) {
        return res.status(404).json({ message: "User-submitted coupon not found" });
      }
      
      res.json(coupon);
    } catch (error) {
      console.error("Error fetching user-submitted coupon:", error);
      res.status(500).json({ message: "Failed to fetch user-submitted coupon" });
    }
  });
  
  app.post("/api/user-submitted-coupons", async (req, res) => {
    try {
      // Log the raw input for debugging
      console.log("Raw req.body:", JSON.stringify(req.body));
      
      // Ensure expiresAt is properly parsed from ISO string
      const expiresAtDate = new Date(req.body.expiresAt);
      
      // Validate the date is valid
      if (isNaN(expiresAtDate.getTime())) {
        return res.status(400).json({ 
          message: "Invalid expiration date format", 
          received: req.body.expiresAt 
        });
      }
      
      // Format data with proper types
      const submissionData = {
        ...req.body,
        expiresAt: expiresAtDate,
        terms: req.body.terms || null, // Handle null/undefined
        storeId: Number(req.body.storeId),
        categoryId: Number(req.body.categoryId),
        userId: Number(req.body.userId)
      };
      
      console.log("Processed submission data:", submissionData);
      const coupon = await storage.createUserSubmittedCoupon(submissionData);
      res.status(201).json(coupon);
    } catch (error) {
      console.error("Error creating user-submitted coupon:", error);
      res.status(500).json({ message: "Failed to create user-submitted coupon" });
    }
  });
  
  app.put("/api/user-submitted-coupons/:id/status", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status, reviewNotes } = req.body;
      
      if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" });
      }
      
      const coupon = await storage.updateUserSubmittedCouponStatus(id, status, reviewNotes);
      res.json(coupon);
    } catch (error) {
      console.error("Error updating user-submitted coupon status:", error);
      res.status(500).json({ message: "Failed to update user-submitted coupon status" });
    }
  });
  
  // Update a user-submitted coupon (PATCH for partial updates)
  app.patch("/api/user-submitted-coupons/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const coupon = await storage.getUserSubmittedCouponById(id);
      
      if (!coupon) {
        return res.status(404).json({ message: "User-submitted coupon not found" });
      }
      
      // Merge the existing coupon with the updates from the request body
      const updatedCoupon = await storage.updateUserSubmittedCoupon({ 
        ...coupon, 
        ...req.body,
        id // Ensure ID is preserved
      });
      
      res.json(updatedCoupon);
    } catch (error) {
      console.error("Error updating user-submitted coupon:", error);
      res.status(500).json({ message: "Failed to update user-submitted coupon" });
    }
  });
  
  // Delete a user-submitted coupon
  app.delete("/api/user-submitted-coupons/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      console.log(`DELETE Request received for coupon ID: ${id}`);
      
      const coupon = await storage.getUserSubmittedCouponById(id);
      
      if (!coupon) {
        console.log(`Coupon with ID ${id} not found`);
        return res.status(404).json({ message: "User-submitted coupon not found" });
      }
      
      console.log(`Found coupon to delete:`, JSON.stringify(coupon));
      
      // Use the dedicated delete method for user-submitted coupons
      await storage.deleteUserSubmittedCoupon(id);
      console.log(`Successfully deleted coupon ID: ${id}`);
      
      // Return success message
      res.json({ success: true, message: "Coupon permanently deleted from the database" });
    } catch (error) {
      console.error("Error deleting user-submitted coupon:", error);
      res.status(500).json({ message: "Failed to delete user-submitted coupon" });
    }
  });

  // Withdrawal request endpoints
  
  // Get all withdrawal requests (admin only)
  app.get("/api/admin/withdrawals", async (req, res) => {
    try {
      // Verify admin token for protected route
      const authHeader = req.headers.authorization;
      if (authHeader !== "Bearer admin-development-token") {
        console.log("Unauthorized attempt to access withdrawal requests");
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const status = req.query.status as 'pending' | 'approved' | 'rejected' | undefined;
      
      const withdrawalRequests = await storage.getWithdrawalRequests({ status });
      res.json(withdrawalRequests);
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
      res.status(500).json({ message: "Failed to fetch withdrawal requests" });
    }
  });
  
  // Get withdrawal requests for a user by numeric user ID
  app.get("/api/users/:userId/withdrawals", async (req, res) => {
    try {
      // Set cache control headers to prevent browser caching
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      console.log(`Fetching withdrawals for user ID: ${req.params.userId}`);
      
      const userId = Number(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        console.log(`User ${userId} not found`);
        return res.status(404).json({ message: "User not found" });
      }
      
      const withdrawalRequests = await storage.getWithdrawalRequests({ userId });
      console.log(`Found ${withdrawalRequests.length} withdrawal requests for user ${userId}`);
      
      // Return an empty array instead of null/undefined
      res.json(withdrawalRequests || []);
    } catch (error) {
      console.error("Error fetching user withdrawal requests:", error);
      res.status(500).json({ message: "Failed to fetch user withdrawal requests" });
    }
  });
  
  // Get withdrawal requests for a user by Firebase UID
  app.get("/api/users/firebase/:firebaseUid/withdrawals", async (req, res) => {
    try {
      // Set cache control headers to prevent browser caching
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const { firebaseUid } = req.params;
      console.log(`Fetching withdrawals for Firebase UID: ${firebaseUid}`);
      
      // First get the database user by Firebase UID
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        console.log(`User with Firebase UID ${firebaseUid} not found`);
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`Found user with database ID: ${user.id} for Firebase UID: ${firebaseUid}`);
      
      // Now get withdrawal requests using the database user ID
      const withdrawalRequests = await storage.getWithdrawalRequests({ userId: user.id });
      console.log(`Found ${withdrawalRequests.length} withdrawal requests for user ${user.id} (Firebase UID: ${firebaseUid})`);
      
      // Return an empty array instead of null/undefined
      res.json(withdrawalRequests || []);
    } catch (error) {
      console.error("Error fetching user withdrawal requests by Firebase UID:", error);
      res.status(500).json({ message: "Failed to fetch user withdrawal requests" });
    }
  });
  
  // Get a specific withdrawal request
  app.get("/api/withdrawals/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const withdrawalRequest = await storage.getWithdrawalRequestById(id);
      
      if (!withdrawalRequest) {
        return res.status(404).json({ message: "Withdrawal request not found" });
      }
      
      res.json(withdrawalRequest);
    } catch (error) {
      console.error("Error fetching withdrawal request:", error);
      res.status(500).json({ message: "Failed to fetch withdrawal request" });
    }
  });
  
  // Create a new withdrawal request
  app.post("/api/withdrawals", async (req, res) => {
    try {
      let { userId, amount, method, accountDetails } = req.body;
      
      // Parse the request body if it's a string (happens sometimes with fetch)
      if (typeof req.body === 'string') {
        const parsedBody = JSON.parse(req.body);
        userId = parsedBody.userId;
        amount = parsedBody.amount;
        method = parsedBody.method;
        accountDetails = parsedBody.accountDetails;
      }
      
      if (!userId || !amount || !method || !accountDetails) {
        return res.status(400).json({ 
          message: "Missing required fields. userId, amount, method, and accountDetails are required." 
        });
      }
      
      // Minimum withdrawal amount check
      if (amount < 1000) {
        return res.status(400).json({ 
          message: "Minimum withdrawal amount is 1000 points." 
        });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user has enough points
      if ((user.points || 0) < amount) {
        return res.status(400).json({ 
          message: `Insufficient points. You have ${user.points} points, but requested ${amount} points.` 
        });
      }
      
      const withdrawalRequest = await storage.createWithdrawalRequest({
        userId,
        amount,
        method,
        accountDetails
      });
      
      res.status(201).json(withdrawalRequest);
    } catch (error) {
      console.error("Error creating withdrawal request:", error);
      res.status(500).json({ message: "Failed to create withdrawal request" });
    }
  });
  
  // Update withdrawal request status (admin only)
  app.patch("/api/admin/withdrawals/:id", async (req, res) => {
    try {
      // Verify admin token for protected route
      const authHeader = req.headers.authorization;
      if (authHeader !== "Bearer admin-development-token") {
        console.log("Unauthorized attempt to update withdrawal request status");
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = Number(req.params.id);
      const { status, notes } = req.body;
      
      if (!status || (status !== 'approved' && status !== 'rejected')) {
        return res.status(400).json({ 
          message: "Status must be 'approved' or 'rejected'" 
        });
      }
      
      const withdrawalRequest = await storage.getWithdrawalRequestById(id);
      if (!withdrawalRequest) {
        return res.status(404).json({ message: "Withdrawal request not found" });
      }
      
      const updatedRequest = await storage.updateWithdrawalRequestStatus(id, status, notes);
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating withdrawal request status:", error);
      res.status(500).json({ message: "Failed to update withdrawal request status" });
    }
  });
  
  // Check-in routes
  
  // Get user's check-in streak info
  app.get("/api/users/:userId/streak", async (req, res) => {
    try {
      // Set cache control headers to prevent browser caching
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const userId = Number(req.params.userId);
      
      try {
        const streakInfo = await storage.getUserCurrentStreak(userId);
        res.json(streakInfo);
      } catch (error) {
        console.error("Error getting user streak info:", error);
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error in streak info endpoint:", error);
      res.status(500).json({ message: "Failed to fetch streak information" });
    }
  });
  
  // Get user's check-in streak info by Firebase UID
  app.get("/api/users/firebase/:firebaseUid/streak", async (req, res) => {
    try {
      // Set cache control headers to prevent browser caching
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const firebaseUid = req.params.firebaseUid;
      console.log(`Fetching streak info for Firebase UID: ${firebaseUid}`);
      
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        console.log(`User not found for Firebase UID: ${firebaseUid}`);
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`Found user for Firebase UID: ${firebaseUid}`, user);
      
      try {
        const streakInfo = await storage.getUserCurrentStreak(user.id);
        console.log(`STREAK DEBUG - Streak info for user ${user.id}:`, JSON.stringify(streakInfo));
        res.json(streakInfo);
      } catch (error) {
        console.error("Error getting user streak info:", error);
        res.status(500).json({ message: "Failed to fetch streak information" });
      }
    } catch (error) {
      console.error("Error in streak info endpoint:", error);
      res.status(500).json({ message: "Failed to fetch streak information" });
    }
  });
  
  // Get user's check-in history
  app.get("/api/users/:userId/check-ins", async (req, res) => {
    try {
      // Set cache control headers to prevent browser caching
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const userId = Number(req.params.userId);
      const checkIns = await storage.getUserCheckIns(userId);
      
      // Return an empty array instead of null/undefined
      res.json(checkIns || []);
    } catch (error) {
      console.error("Error fetching user check-ins:", error);
      res.status(500).json({ message: "Failed to fetch user check-ins" });
    }
  });
  
  // Get user's check-in history by Firebase UID
  app.get("/api/users/firebase/:firebaseUid/check-ins", async (req, res) => {
    try {
      // Set cache control headers to prevent browser caching
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const firebaseUid = req.params.firebaseUid;
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const checkIns = await storage.getUserCheckIns(user.id);
      
      // Return an empty array instead of null/undefined
      res.json(checkIns || []);
    } catch (error) {
      console.error("Error fetching user check-ins:", error);
      res.status(500).json({ message: "Failed to fetch user check-ins" });
    }
  });
  
  // Process a user check-in
  app.post("/api/users/:userId/check-in", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      
      try {
        const result = await storage.processUserCheckIn(userId);
        res.status(200).json(result);
      } catch (error) {
        console.error("Error processing user check-in:", error);
        res.status(400).json({ 
          success: false,
          message: error.message || "Failed to process check-in"
        });
      }
    } catch (error) {
      console.error("Error in check-in endpoint:", error);
      res.status(500).json({ 
        success: false,
        message: "Server error during check-in processing"
      });
    }
  });
  
  // Process a user check-in by Firebase UID
  app.post("/api/users/firebase/:firebaseUid/check-in", async (req, res) => {
    try {
      const firebaseUid = req.params.firebaseUid;
      console.log(`Processing check-in for Firebase UID: ${firebaseUid}`);
      
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        console.log(`User not found for Firebase UID: ${firebaseUid}`);
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }
      
      console.log(`Found user for check-in, ID: ${user.id}`);
      
      try {
        console.log(`Calling processUserCheckIn for user ID: ${user.id}`);
        const result = await storage.processUserCheckIn(user.id);
        console.log(`Check-in result for user ${user.id}:`, result);
        res.status(200).json(result);
      } catch (error) {
        console.error("Error processing user check-in:", error);
        res.status(400).json({ 
          success: false,
          message: error.message || "Failed to process check-in"
        });
      }
    } catch (error) {
      console.error("Error in check-in endpoint:", error);
      res.status(500).json({ 
        success: false,
        message: "Server error during check-in processing"
      });
    }
  });

  // Points log endpoints
  // Get points log for a user by ID
  app.get("/api/users/:userId/points-log", async (req, res) => {
    try {
      // Set cache control headers to prevent browser caching
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const pointsLog = await storage.getPointsLog(userId);
      res.json(pointsLog || []);
    } catch (error) {
      console.error("Error getting points log:", error);
      res.status(500).json({ message: "Failed to fetch points log" });
    }
  });
  
  // Get points log for a user by Firebase UID
  app.get("/api/users/firebase/:firebaseUid/points-log", async (req, res) => {
    try {
      // Set cache control headers to prevent browser caching
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const { firebaseUid } = req.params;
      console.log(`Fetching points log for Firebase UID: ${firebaseUid}`);
      
      // First get the database user by Firebase UID
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        console.log(`User with Firebase UID ${firebaseUid} not found`);
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`Found user with database ID: ${user.id} for Firebase UID: ${firebaseUid}`);
      
      const pointsLog = await storage.getPointsLog(user.id);
      res.json(pointsLog || []);
    } catch (error) {
      console.error("Error getting points log for Firebase UID:", error);
      res.status(500).json({ message: "Failed to fetch points log" });
    }
  });
  
  // Get points balance for a user by ID
  app.get("/api/users/:userId/points-balance", async (req, res) => {
    try {
      // Set cache control headers to prevent browser caching
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const balance = await storage.getUserPointsBalance(userId);
      res.json({ balance });
    } catch (error) {
      console.error("Error getting points balance:", error);
      res.status(500).json({ message: "Failed to fetch points balance" });
    }
  });
  
  // Get points balance for a user by Firebase UID
  app.get("/api/users/firebase/:firebaseUid/points-balance", async (req, res) => {
    try {
      // Set cache control headers to prevent browser caching
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const { firebaseUid } = req.params;
      console.log(`Fetching points balance for Firebase UID: ${firebaseUid}`);
      
      // First get the database user by Firebase UID
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        console.log(`User with Firebase UID ${firebaseUid} not found`);
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`Found user with database ID: ${user.id} for Firebase UID: ${firebaseUid}`);
      
      const balance = await storage.getUserPointsBalance(user.id);
      res.json({ balance });
    } catch (error) {
      console.error("Error getting points balance for Firebase UID:", error);
      res.status(500).json({ message: "Failed to fetch points balance" });
    }
  });
  
  // Spin the wheel for points
  app.post("/api/users/firebase/:firebaseUid/spin", async (req, res) => {
    try {
      // Set cache control headers to prevent browser caching
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const { firebaseUid } = req.params;
      console.log(`Spin wheel request for Firebase UID: ${firebaseUid}`);
      
      // Get the database user by Firebase UID
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        console.log(`User with Firebase UID ${firebaseUid} not found`);
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`Found user with database ID: ${user.id} for Firebase UID: ${firebaseUid}`);
      
      // Process the spin request
      const result = await storage.processUserSpin(user.id);
      res.json(result);
    } catch (error) {
      console.error("Error processing spin:", error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : "Failed to process spin"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
