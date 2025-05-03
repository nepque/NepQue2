import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
