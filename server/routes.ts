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
    
    if (authHeader === "Bearer admin-development-token") {
      res.json({ isAdmin: true });
    } else {
      res.json({ isAdmin: false });
    }
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

  app.get("/api/categories/with-counts", async (_req, res) => {
    try {
      const categoriesWithCounts = await storage.getCategoryWithCouponCount();
      res.json(categoriesWithCounts);
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

  app.get("/api/stores/with-counts", async (_req, res) => {
    try {
      const storesWithCounts = await storage.getStoreWithCouponCount();
      res.json(storesWithCounts);
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
      const coupon = await storage.createUserSubmittedCoupon(req.body);
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

  const httpServer = createServer(app);
  return httpServer;
}
