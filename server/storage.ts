import { coupons, type Coupon, type InsertCoupon, type CouponWithRelations } from "@shared/schema";
import { categories, type Category, type InsertCategory } from "@shared/schema";
import { stores, type Store, type InsertStore } from "@shared/schema";
import { users, type User, type InsertUser } from "@shared/schema";
import { 
  userSubmittedCoupons, 
  type UserSubmittedCoupon, 
  type InsertUserSubmittedCoupon, 
  type UserSubmittedCouponWithRelations 
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(user: Partial<User> & { id: number }): Promise<User>;
  updateUserPreferences(userId: number, preferences: { 
    preferredCategories?: number[], 
    preferredStores?: number[],
    hasCompletedOnboarding?: boolean
  }): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(category: Category): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Store operations
  getStores(): Promise<Store[]>;
  getStoreById(id: number): Promise<Store | undefined>;
  getStoreBySlug(slug: string): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(store: Store): Promise<Store>;
  deleteStore(id: number): Promise<void>;

  // Coupon operations
  getCoupons(options?: { 
    categoryId?: number, 
    storeId?: number, 
    featured?: boolean, 
    search?: string,
    sortBy?: 'newest' | 'expiring' | 'popular'
  }): Promise<CouponWithRelations[]>;
  getCouponById(id: number): Promise<CouponWithRelations | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(coupon: Coupon): Promise<Coupon>;
  deleteCoupon(id: number): Promise<void>;
  incrementCouponUsage(id: number): Promise<void>;
  
  // User-submitted coupon operations
  getUserSubmittedCoupons(options?: {
    userId?: number,
    status?: 'pending' | 'approved' | 'rejected',
    sortBy?: 'newest'
  }): Promise<UserSubmittedCouponWithRelations[]>;
  getUserSubmittedCouponById(id: number): Promise<UserSubmittedCouponWithRelations | undefined>;
  createUserSubmittedCoupon(coupon: InsertUserSubmittedCoupon): Promise<UserSubmittedCoupon>;
  updateUserSubmittedCoupon(coupon: UserSubmittedCoupon): Promise<UserSubmittedCoupon>;
  updateUserSubmittedCouponStatus(id: number, status: 'approved' | 'rejected', reviewNotes?: string): Promise<UserSubmittedCoupon>;
  deleteUserSubmittedCoupon(id: number): Promise<void>;
  
  // Statistics
  getStoreWithCouponCount(): Promise<(Store & { couponCount: number })[]>;
  getCategoryWithCouponCount(): Promise<(Category & { couponCount: number })[]>;
  
  // Heat map data
  getCouponUsageByCategory(): Promise<{ category: string; usageCount: number; coupons: number }[]>;
  getCouponUsageByMonth(): Promise<{ month: string; usageCount: number; coupons: number }[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private stores: Map<number, Store>;
  private coupons: Map<number, Coupon>;
  private userSubmittedCoupons: Map<number, UserSubmittedCoupon>;
  currentUserId: number;
  currentCategoryId: number;
  currentStoreId: number;
  currentCouponId: number;
  currentUserSubmittedCouponId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.stores = new Map();
    this.coupons = new Map();
    this.userSubmittedCoupons = new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentStoreId = 1;
    this.currentCouponId = 1;
    this.currentUserSubmittedCouponId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      isBanned: false,
      createdAt: now,
      lastLogin: now,
      preferredCategories: insertUser.preferredCategories || null,
      preferredStores: insertUser.preferredStores || null,
      hasCompletedOnboarding: insertUser.hasCompletedOnboarding || false,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(user: Partial<User> & { id: number }): Promise<User> {
    const existing = await this.getUser(user.id);
    if (!existing) {
      throw new Error(`User with ID ${user.id} not found`);
    }

    const updatedUser: User = { ...existing, ...user };
    this.users.set(user.id, updatedUser);
    return updatedUser;
  }

  async updateUserPreferences(userId: number, preferences: { 
    preferredCategories?: number[],
    preferredStores?: number[],
    hasCompletedOnboarding?: boolean
  }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const updatedUser: User = { 
      ...user,
      preferredCategories: preferences.preferredCategories !== undefined 
        ? preferences.preferredCategories 
        : user.preferredCategories,
      preferredStores: preferences.preferredStores !== undefined 
        ? preferences.preferredStores 
        : user.preferredStores,
      hasCompletedOnboarding: preferences.hasCompletedOnboarding !== undefined 
        ? preferences.hasCompletedOnboarding 
        : user.hasCompletedOnboarding
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug,
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(category: Category): Promise<Category> {
    const existing = await this.getCategoryById(category.id);
    if (!existing) {
      throw new Error(`Category with ID ${category.id} not found`);
    }
    this.categories.set(category.id, category);
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    const existing = await this.getCategoryById(id);
    if (!existing) {
      throw new Error(`Category with ID ${id} not found`);
    }
    this.categories.delete(id);
  }

  // Store operations
  async getStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }

  async getStoreById(id: number): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async getStoreBySlug(slug: string): Promise<Store | undefined> {
    return Array.from(this.stores.values()).find(
      (store) => store.slug === slug,
    );
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const id = this.currentStoreId++;
    const store: Store = { ...insertStore, id };
    this.stores.set(id, store);
    return store;
  }

  async updateStore(store: Store): Promise<Store> {
    const existing = await this.getStoreById(store.id);
    if (!existing) {
      throw new Error(`Store with ID ${store.id} not found`);
    }
    this.stores.set(store.id, store);
    return store;
  }

  async deleteStore(id: number): Promise<void> {
    const existing = await this.getStoreById(id);
    if (!existing) {
      throw new Error(`Store with ID ${id} not found`);
    }
    this.stores.delete(id);
  }

  // Coupon operations
  async getCoupons(options?: { 
    categoryId?: number, 
    storeId?: number, 
    featured?: boolean, 
    search?: string,
    sortBy?: 'newest' | 'expiring' | 'popular'
  }): Promise<CouponWithRelations[]> {
    let filteredCoupons = Array.from(this.coupons.values());

    // Apply filters
    if (options?.categoryId) {
      filteredCoupons = filteredCoupons.filter(
        (coupon) => coupon.categoryId === options.categoryId,
      );
    }

    if (options?.storeId) {
      filteredCoupons = filteredCoupons.filter(
        (coupon) => coupon.storeId === options.storeId,
      );
    }

    if (options?.featured !== undefined) {
      filteredCoupons = filteredCoupons.filter(
        (coupon) => coupon.featured === options.featured,
      );
    }

    if (options?.search) {
      const searchLower = options.search.toLowerCase();
      filteredCoupons = filteredCoupons.filter(
        (coupon) => {
          const couponTitle = coupon.title.toLowerCase();
          const couponDesc = coupon.description.toLowerCase();
          const store = this.stores.get(coupon.storeId);
          const storeName = store ? store.name.toLowerCase() : '';
          
          return (
            couponTitle.includes(searchLower) || 
            couponDesc.includes(searchLower) ||
            storeName.includes(searchLower)
          );
        }
      );
    }

    // Apply sorting
    if (options?.sortBy) {
      switch (options.sortBy) {
        case 'newest':
          // For in-memory, we'll assume newest has highest ID
          filteredCoupons.sort((a, b) => b.id - a.id);
          break;
        case 'expiring':
          filteredCoupons.sort((a, b) => 
            new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
          );
          break;
        case 'popular':
          filteredCoupons.sort((a, b) => b.usedCount - a.usedCount);
          break;
      }
    }

    // Add store and category info to each coupon
    return filteredCoupons.map(coupon => {
      const store = this.stores.get(coupon.storeId)!;
      const category = this.categories.get(coupon.categoryId)!;
      return { ...coupon, store, category };
    });
  }

  async getCouponById(id: number): Promise<CouponWithRelations | undefined> {
    const coupon = this.coupons.get(id);
    if (!coupon) return undefined;

    const store = this.stores.get(coupon.storeId)!;
    const category = this.categories.get(coupon.categoryId)!;
    
    return { ...coupon, store, category };
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const id = this.currentCouponId++;
    const coupon: Coupon = { ...insertCoupon, id };
    this.coupons.set(id, coupon);
    return coupon;
  }

  async updateCoupon(coupon: Coupon): Promise<Coupon> {
    const existing = await this.getCouponById(coupon.id);
    if (!existing) {
      throw new Error(`Coupon with ID ${coupon.id} not found`);
    }
    this.coupons.set(coupon.id, coupon);
    return coupon;
  }

  async deleteCoupon(id: number): Promise<void> {
    const existing = await this.getCouponById(id);
    if (!existing) {
      throw new Error(`Coupon with ID ${id} not found`);
    }
    this.coupons.delete(id);
  }

  async incrementCouponUsage(id: number): Promise<void> {
    const coupon = this.coupons.get(id);
    if (coupon) {
      coupon.usedCount = (coupon.usedCount || 0) + 1;
      this.coupons.set(id, coupon);
    }
  }

  // Statistics
  async getStoreWithCouponCount(): Promise<(Store & { couponCount: number })[]> {
    const stores = await this.getStores();
    const coupons = Array.from(this.coupons.values());
    
    return stores.map(store => {
      const couponCount = coupons.filter(c => c.storeId === store.id).length;
      return { ...store, couponCount };
    }).sort((a, b) => b.couponCount - a.couponCount);
  }

  async getCategoryWithCouponCount(): Promise<(Category & { couponCount: number })[]> {
    const categories = await this.getCategories();
    const coupons = Array.from(this.coupons.values());
    
    return categories.map(category => {
      const couponCount = coupons.filter(c => c.categoryId === category.id).length;
      return { ...category, couponCount };
    }).sort((a, b) => b.couponCount - a.couponCount);
  }

  // Heat map data methods
  async getCouponUsageByCategory(): Promise<{ category: string; usageCount: number; coupons: number }[]> {
    const categories = await this.getCategories();
    const coupons = Array.from(this.coupons.values());
    
    return categories.map(category => {
      const categoryCoupons = coupons.filter(c => c.categoryId === category.id);
      const usageCount = categoryCoupons.reduce((sum, coupon) => sum + (coupon.usedCount || 0), 0);
      
      return {
        category: category.name,
        usageCount,
        coupons: categoryCoupons.length
      };
    });
  }

  async getCouponUsageByMonth(): Promise<{ month: string; usageCount: number; coupons: number }[]> {
    // Generate data for the last 12 months
    const coupons = Array.from(this.coupons.values());
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const now = new Date();
    const currentMonth = now.getMonth();
    
    // For demo purposes, we'll generate some random usage data for each month
    return months.map((month, index) => {
      // Calculate relative month (0-11) starting from current month and going back
      const relativeIndex = (currentMonth - index + 12) % 12;
      
      // For demo, we'll simulate more usage in recent months
      const monthFactor = 1 - (index * 0.05);
      // Base usage is sum of all coupon usage divided by 12 (for each month)
      const baseUsage = coupons.reduce((sum, coupon) => sum + (coupon.usedCount || 0), 0) / 12;
      // Apply month factor to simulate more recent usage
      const usageCount = Math.round(baseUsage * monthFactor);
      
      // Similarly for coupon count
      const baseCoupons = coupons.length / 3; // Assuming about 1/3 of coupons are active in each month
      const couponCount = Math.round(baseCoupons * monthFactor);

      return {
        month: months[relativeIndex],
        usageCount,
        coupons: couponCount
      };
    });
  }

  // User-submitted coupon operations
  async getUserSubmittedCoupons(options?: {
    userId?: number,
    status?: 'pending' | 'approved' | 'rejected',
    sortBy?: 'newest'
  }): Promise<UserSubmittedCouponWithRelations[]> {
    let filteredCoupons = Array.from(this.userSubmittedCoupons.values());

    // Apply filters
    if (options?.userId) {
      filteredCoupons = filteredCoupons.filter(
        (coupon) => coupon.userId === options.userId,
      );
    }

    if (options?.status) {
      filteredCoupons = filteredCoupons.filter(
        (coupon) => coupon.status === options.status,
      );
    }

    // Apply sorting
    if (options?.sortBy === 'newest') {
      filteredCoupons.sort((a, b) => {
        return new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime();
      });
    }

    // Add relations
    return filteredCoupons.map(coupon => {
      const store = this.stores.get(coupon.storeId)!;
      const category = this.categories.get(coupon.categoryId)!;
      const user = this.users.get(coupon.userId)!;
      return { ...coupon, store, category, user };
    });
  }

  async getUserSubmittedCouponById(id: number): Promise<UserSubmittedCouponWithRelations | undefined> {
    const coupon = this.userSubmittedCoupons.get(id);
    if (!coupon) return undefined;

    const store = this.stores.get(coupon.storeId)!;
    const category = this.categories.get(coupon.categoryId)!;
    const user = this.users.get(coupon.userId)!;
    
    return { ...coupon, store, category, user };
  }

  async createUserSubmittedCoupon(insertCoupon: InsertUserSubmittedCoupon): Promise<UserSubmittedCoupon> {
    const id = this.currentUserSubmittedCouponId++;
    const now = new Date();
    
    const coupon: UserSubmittedCoupon = { 
      ...insertCoupon, 
      id,
      status: 'pending',
      submittedAt: now,
      reviewedAt: null,
      reviewNotes: null
    };
    
    this.userSubmittedCoupons.set(id, coupon);
    return coupon;
  }

  async updateUserSubmittedCoupon(coupon: UserSubmittedCoupon): Promise<UserSubmittedCoupon> {
    const existing = this.userSubmittedCoupons.get(coupon.id);
    if (!existing) {
      throw new Error(`User submitted coupon with ID ${coupon.id} not found`);
    }
    
    // Preserve certain fields from the original coupon
    const updatedCoupon: UserSubmittedCoupon = {
      ...coupon,
      status: existing.status, // Keep original status
      submittedAt: existing.submittedAt, // Keep original submission time
      reviewedAt: existing.reviewedAt, // Keep original review time
    };
    
    this.userSubmittedCoupons.set(coupon.id, updatedCoupon);
    return updatedCoupon;
  }

  async updateUserSubmittedCouponStatus(
    id: number, 
    status: 'approved' | 'rejected', 
    reviewNotes?: string
  ): Promise<UserSubmittedCoupon> {
    const coupon = this.userSubmittedCoupons.get(id);
    if (!coupon) {
      throw new Error(`User-submitted coupon with ID ${id} not found`);
    }

    const now = new Date();
    const updatedCoupon: UserSubmittedCoupon = {
      ...coupon,
      status,
      reviewedAt: now,
      reviewNotes: reviewNotes || null
    };

    this.userSubmittedCoupons.set(id, updatedCoupon);

    // If approved, create a regular coupon from the user-submitted one
    if (status === 'approved') {
      await this.createCoupon({
        title: coupon.title,
        description: coupon.description,
        code: coupon.code,
        storeId: coupon.storeId,
        categoryId: coupon.categoryId,
        expiresAt: coupon.expiresAt,
        terms: coupon.terms || null,
        featured: false,
        verified: true,
        usedCount: 0
      });
    }

    return updatedCoupon;
  }

  async deleteUserSubmittedCoupon(id: number): Promise<void> {
    const existing = this.userSubmittedCoupons.get(id);
    if (!existing) {
      throw new Error(`User-submitted coupon with ID ${id} not found`);
    }
    this.userSubmittedCoupons.delete(id);
  }
}

export const storage = new MemStorage();

// Initialize with some seed data
(async () => {
  // Create some categories
  const categoriesData: InsertCategory[] = [
    { name: "Retail", slug: "retail", icon: "shopping-cart", color: "blue" },
    { name: "Fashion", slug: "fashion", icon: "tshirt", color: "green" },
    { name: "Electronics", slug: "electronics", icon: "laptop", color: "purple" },
    { name: "Food", slug: "food", icon: "utensils", color: "red" },
    { name: "Travel", slug: "travel", icon: "plane", color: "yellow" },
  ];

  for (const category of categoriesData) {
    await storage.createCategory(category);
  }

  // Create some stores
  const storesData: InsertStore[] = [
    { name: "Amazon", slug: "amazon", logo: "https://logo.clearbit.com/amazon.com", website: "https://amazon.com" },
    { name: "Walmart", slug: "walmart", logo: "https://logo.clearbit.com/walmart.com", website: "https://walmart.com" },
    { name: "Target", slug: "target", logo: "https://logo.clearbit.com/target.com", website: "https://target.com" },
    { name: "Best Buy", slug: "best-buy", logo: "https://logo.clearbit.com/bestbuy.com", website: "https://bestbuy.com" },
    { name: "DoorDash", slug: "doordash", logo: "https://logo.clearbit.com/doordash.com", website: "https://doordash.com" },
    { name: "Nike", slug: "nike", logo: "https://logo.clearbit.com/nike.com", website: "https://nike.com" },
    { name: "Macy's", slug: "macys", logo: "https://logo.clearbit.com/macys.com", website: "https://macys.com" },
    { name: "Kohl's", slug: "kohls", logo: "https://logo.clearbit.com/kohls.com", website: "https://kohls.com" },
    { name: "Home Depot", slug: "home-depot", logo: "https://logo.clearbit.com/homedepot.com", website: "https://homedepot.com" },
    { name: "Lowe's", slug: "lowes", logo: "https://logo.clearbit.com/lowes.com", website: "https://lowes.com" },
    { name: "Adidas", slug: "adidas", logo: "https://logo.clearbit.com/adidas.com", website: "https://adidas.com" },
    { name: "Samsung", slug: "samsung", logo: "https://logo.clearbit.com/samsung.com", website: "https://samsung.com" },
  ];

  for (const store of storesData) {
    await storage.createStore(store);
  }

  // Create some coupons
  const now = new Date();
  const oneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const twoMonths = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  const couponsData: InsertCoupon[] = [
    { 
      title: "20% Off Electronics & Free Shipping", 
      description: "Get 20% off on all electronics and enjoy free shipping on orders over $25.",
      code: "SUMMER20",
      storeId: 1, // Amazon
      categoryId: 3, // Electronics
      expiresAt: oneMonth,
      featured: true,
      verified: true,
      terms: "Valid for all electronics categories\nMinimum purchase of $25 required\nOne coupon per customer\nCannot be combined with other offers\nValid for new and existing customers",
      usedCount: 2400
    },
    { 
      title: "$10 Off Your $50+ Purchase", 
      description: "Save $10 when you spend $50 or more on groceries, home goods, and more.",
      code: "SAVE10WM",
      storeId: 2, // Walmart
      categoryId: 1, // Retail
      expiresAt: twoMonths,
      featured: true,
      verified: false,
      terms: "Valid on purchases of $50 or more\nExcludes alcohol and gift cards\nOne coupon per transaction\nCannot be combined with other coupons",
      usedCount: 1800
    },
    { 
      title: "25% Off Home Decor", 
      description: "Save 25% on all home decor items, including furniture, bedding, and more.",
      code: "HOME25",
      storeId: 3, // Target
      categoryId: 1, // Retail
      expiresAt: tomorrow,
      featured: true,
      verified: false,
      terms: "Valid on home decor items only\nExcludes clearance items\nOne coupon per customer\nIn-store and online",
      usedCount: 3200
    },
    { 
      title: "$50 Off Laptops Over $500", 
      description: "Save $50 on select laptops priced $500 or more. Includes major brands.",
      code: "LAPTOP50",
      storeId: 4, // Best Buy
      categoryId: 3, // Electronics
      expiresAt: oneMonth,
      featured: true,
      verified: true,
      terms: "Valid on laptops $500+\nMust be signed in to rewards account\nOne coupon per transaction\nValid for online purchases only",
      usedCount: 956
    },
    { 
      title: "$15 Off First Order", 
      description: "Get $15 off your first order of $20 or more. New customers only.",
      code: "FIRST15",
      storeId: 5, // DoorDash
      categoryId: 4, // Food
      expiresAt: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000), // 6 months
      featured: true,
      verified: true,
      terms: "New customers only\nMinimum order of $20\nDelivery fee not included\nOne-time use only",
      usedCount: 5100
    },
    { 
      title: "30% Off Clearance Items", 
      description: "Take an extra 30% off already reduced clearance items. Includes shoes and apparel.",
      code: "EXTRA30",
      storeId: 6, // Nike
      categoryId: 2, // Fashion
      expiresAt: oneMonth,
      featured: true,
      verified: false,
      terms: "Valid on clearance items only\nDiscount applied at checkout\nCannot be combined with other promotions\nValid online and in select stores",
      usedCount: 1200
    },
    { 
      title: "Free Shipping on Orders $25+", 
      description: "Get free standard shipping on all orders of $25 or more. No code needed.",
      code: "FREESHIP",
      storeId: 7, // Macy's
      categoryId: 2, // Fashion
      expiresAt: twoMonths,
      featured: false,
      verified: true,
      terms: "Minimum purchase of $25\nStandard shipping only\nContiguous US only\nAutomatically applied at checkout",
      usedCount: 950
    },
  ];

  for (const coupon of couponsData) {
    await storage.createCoupon(coupon);
  }
})();
