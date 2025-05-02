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

  const httpServer = createServer(app);
  return httpServer;
}
