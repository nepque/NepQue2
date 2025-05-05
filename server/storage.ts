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
import {
  withdrawalRequests,
  type WithdrawalRequest,
  type InsertWithdrawalRequest,
  type WithdrawalRequestWithUser
} from "@shared/schema";
import {
  checkIns,
  type CheckIn,
  type InsertCheckIn
} from "@shared/schema";
import {
  pointsLog,
  type PointsLog,
  type InsertPointsLog
} from "@shared/schema";
import {
  bannerAds,
  type BannerAd,
  type InsertBannerAd
} from "@shared/schema";
import {
  contentPages,
  type ContentPage,
  type InsertContentPage
} from "@shared/schema";
import {
  siteSettings,
  type SiteSetting,
  type InsertSiteSetting
} from "@shared/schema";
import {
  subscribers,
  type Subscriber,
  type InsertSubscriber
} from "@shared/schema";
import {
  socialMediaLinks,
  type SocialMediaLink,
  type InsertSocialMediaLink
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // Banner ad operations
  getBannerAds(options?: { 
    location?: string,
    isActive?: boolean 
  }): Promise<BannerAd[]>;
  getBannerAdById(id: number): Promise<BannerAd | undefined>;
  createBannerAd(bannerAd: InsertBannerAd): Promise<BannerAd>;
  updateBannerAd(bannerAd: BannerAd): Promise<BannerAd>;
  toggleBannerAdStatus(id: number): Promise<BannerAd>;
  deleteBannerAd(id: number): Promise<void>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(user: Partial<User> & { id: number }): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  updateUserPreferences(userId: number, preferences: { 
    preferredCategories?: number[], 
    preferredStores?: number[],
    hasCompletedOnboarding?: boolean
  }): Promise<User>;
  
  // Points log operations
  getPointsLog(userId: number): Promise<PointsLog[]>;
  addPointsLog(log: InsertPointsLog): Promise<PointsLog>;
  getUserPointsBalance(userId: number): Promise<number>;

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
  
  // Withdrawal requests operations
  getWithdrawalRequests(options?: {
    userId?: number,
    status?: 'pending' | 'approved' | 'rejected'
  }): Promise<WithdrawalRequestWithUser[]>;
  getWithdrawalRequestById(id: number): Promise<WithdrawalRequestWithUser | undefined>;
  createWithdrawalRequest(request: InsertWithdrawalRequest): Promise<WithdrawalRequest>;
  updateWithdrawalRequestStatus(id: number, status: 'approved' | 'rejected', notes?: string): Promise<WithdrawalRequest>;
  
  // Check-in operations
  processUserCheckIn(userId: number): Promise<{ 
    success: boolean; 
    points: number; 
    newStreak: number; 
    nextCheckInTime: string;
    message: string; 
  }>;
  getUserCheckIns(userId: number): Promise<CheckIn[]>;
  getUserCurrentStreak(userId: number): Promise<{
    currentStreak: number;
    lastCheckIn: string | null;
    canCheckInNow: boolean;
    nextCheckInTime: string | null;
  }>;
  
  // Statistics
  getStoreWithCouponCount(): Promise<(Store & { couponCount: number })[]>;
  getCategoryWithCouponCount(): Promise<(Category & { couponCount: number })[]>;
  
  // Heat map data
  getCouponUsageByCategory(): Promise<{ category: string; usageCount: number; coupons: number }[]>;
  getCouponUsageByMonth(): Promise<{ month: string; usageCount: number; coupons: number }[]>;
  
  // Spin the wheel operations
  processUserSpin(userId: number): Promise<{
    success: boolean;
    points: number;
    nextSpinTime: string;
    message: string;
  }>;
  
  // Newsletter subscriber operations
  getAllSubscribers(): Promise<Subscriber[]>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  createSubscriber(data: InsertSubscriber): Promise<Subscriber | undefined>;
  updateSubscriber(id: number, data: Partial<InsertSubscriber>): Promise<Subscriber | undefined>;
  deleteSubscriber(id: number): Promise<boolean>;
  
  // Social media links operations
  getAllSocialMediaLinks(): Promise<SocialMediaLink[]>;
  getSocialMediaLinkById(id: number): Promise<SocialMediaLink | undefined>;
  createSocialMediaLink(data: InsertSocialMediaLink): Promise<SocialMediaLink>;
  updateSocialMediaLink(id: number, data: Partial<InsertSocialMediaLink>): Promise<SocialMediaLink>;
  toggleSocialMediaLinkStatus(id: number): Promise<SocialMediaLink>;
  deleteSocialMediaLink(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private stores: Map<number, Store>;
  private coupons: Map<number, Coupon>;
  private userSubmittedCoupons: Map<number, UserSubmittedCoupon>;
  private withdrawalRequests: Map<number, WithdrawalRequest>;
  private checkIns: Map<number, CheckIn>;
  private pointsLogs: Map<number, PointsLog>;
  private bannerAds: Map<number, BannerAd>;
  private subscribers: Map<number, Subscriber>;
  private socialMediaLinks: Map<number, SocialMediaLink>;
  
  currentUserId: number;
  currentCategoryId: number;
  currentStoreId: number;
  currentCouponId: number;
  currentUserSubmittedCouponId: number;
  currentWithdrawalRequestId: number;
  currentCheckInId: number;
  currentPointsLogId: number;
  currentBannerAdId: number;
  currentSubscriberId: number;
  currentSocialMediaLinkId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.stores = new Map();
    this.coupons = new Map();
    this.userSubmittedCoupons = new Map();
    this.withdrawalRequests = new Map();
    this.checkIns = new Map();
    this.pointsLogs = new Map();
    this.bannerAds = new Map();
    this.subscribers = new Map();
    this.socialMediaLinks = new Map();
    
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentStoreId = 1;
    this.currentCouponId = 1;
    this.currentUserSubmittedCouponId = 1;
    this.currentWithdrawalRequestId = 1;
    this.currentCheckInId = 1;
    this.currentPointsLogId = 1;
    this.currentBannerAdId = 1;
    this.currentSubscriberId = 1;
    this.currentSocialMediaLinkId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    
    // Ensure isBanned is always a boolean
    if (user && user.isBanned === undefined) {
      user.isBanned = false;
    }
    
    return user;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid,
    );
    
    // Ensure isBanned is always a boolean
    if (user && user.isBanned === undefined) {
      user.isBanned = false;
    }
    
    return user;
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
  
  async getAllUsers(): Promise<User[]> {
    const users = Array.from(this.users.values());
    
    // Ensure isBanned is always a boolean for all users
    for (const user of users) {
      if (user.isBanned === undefined) {
        user.isBanned = false;
      }
    }
    
    return users;
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    this.users.delete(id);
  }
  
  // Points log operations
  async getPointsLog(userId: number): Promise<PointsLog[]> {
    const logs = Array.from(this.pointsLogs.values());
    return logs.filter(log => log.userId === userId);
  }
  
  async addPointsLog(insertLog: InsertPointsLog): Promise<PointsLog> {
    const id = this.currentPointsLogId++;
    const now = new Date();
    const log: PointsLog = {
      ...insertLog,
      id,
      createdAt: now
    };
    this.pointsLogs.set(id, log);
    
    // Update the user's points balance
    const user = await this.getUser(insertLog.userId);
    if (user) {
      const currentPoints = user.points || 0;
      user.points = currentPoints + insertLog.points;
      this.users.set(user.id, user);
    }
    
    return log;
  }
  
  async getUserPointsBalance(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return user.points || 0;
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
      console.log(`DEBUG: In-memory search for term: "${options.search}"`);
      const searchLower = options.search.toLowerCase();
      
      // First try exact match on store name (to match database implementation behavior)
      const exactStoreMatch = Array.from(this.stores.values()).find(
        store => store.name.toLowerCase() === searchLower
      );
      
      if (exactStoreMatch) {
        console.log(`DEBUG: Found exact store name match for "${searchLower}": ${exactStoreMatch.name} (ID: ${exactStoreMatch.id})`);
        // If we have an exact store name match, only return coupons from that store
        filteredCoupons = filteredCoupons.filter(
          coupon => coupon.storeId === exactStoreMatch.id
        );
        console.log(`DEBUG: In-memory exact store match found ${filteredCoupons.length} coupons for ${exactStoreMatch.name}`);
      } else {
        // Otherwise do standard partial matching
        console.log('DEBUG: No exact store match, performing partial text search');
        
        filteredCoupons = filteredCoupons.filter(
          (coupon) => {
            const couponTitle = coupon.title.toLowerCase();
            const couponDesc = coupon.description.toLowerCase();
            const store = this.stores.get(coupon.storeId);
            const storeName = store ? store.name.toLowerCase() : '';
            
            // Focus on title, description, and store name for consistency with DB implementation
            const matches = 
              couponTitle.includes(searchLower) || 
              couponDesc.includes(searchLower) ||
              storeName.includes(searchLower);
              
            if (storeName.includes(searchLower)) {
              console.log(`DEBUG: In-memory partial match found in store name: ${store?.name}`);
            }
              
            return matches;
          }
        );
        console.log(`DEBUG: In-memory partial search found ${filteredCoupons.length} results`);
      }
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

  // Withdrawal request operations
  async getWithdrawalRequests(options?: {
    userId?: number,
    status?: 'pending' | 'approved' | 'rejected'
  }): Promise<WithdrawalRequestWithUser[]> {
    let filteredRequests = Array.from(this.withdrawalRequests.values());
    
    if (options?.userId) {
      filteredRequests = filteredRequests.filter(
        request => request.userId === options.userId
      );
    }
    
    if (options?.status) {
      filteredRequests = filteredRequests.filter(
        request => request.status === options.status
      );
    }
    
    // Sort by newest first based on requestedAt
    filteredRequests.sort((a, b) => {
      return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
    });
    
    // Add user info to each request
    return filteredRequests.map(request => {
      const user = this.users.get(request.userId)!;
      return { ...request, user };
    });
  }

  async getWithdrawalRequestById(id: number): Promise<WithdrawalRequestWithUser | undefined> {
    const request = this.withdrawalRequests.get(id);
    if (!request) return undefined;
    
    const user = this.users.get(request.userId)!;
    return { ...request, user };
  }

  async createWithdrawalRequest(insertRequest: InsertWithdrawalRequest): Promise<WithdrawalRequest> {
    // Validate user exists and has enough points
    const user = this.users.get(insertRequest.userId);
    if (!user) {
      throw new Error(`User with ID ${insertRequest.userId} not found`);
    }
    
    if ((user.points || 0) < insertRequest.amount) {
      throw new Error(`Insufficient points. User has ${user.points} points, requested ${insertRequest.amount}`);
    }
    
    // Create the withdrawal request
    const id = this.currentWithdrawalRequestId++;
    const now = new Date();
    
    const request: WithdrawalRequest = {
      ...insertRequest,
      id,
      status: 'pending',
      requestedAt: now,
      processedAt: null,
      notes: null
    };
    
    this.withdrawalRequests.set(id, request);
    
    // Create a points log entry (negative points for withdrawal)
    this.addPointsLog({
      userId: user.id,
      points: -insertRequest.amount, // Use negative value for deduction
      action: 'withdrawal_request',
      description: `Withdrawal request for ${insertRequest.amount} points (${insertRequest.method})`
    });
    
    // Note: No need to manually update user points as addPointsLog handles that already
    
    return request;
  }

  async updateWithdrawalRequestStatus(id: number, status: 'approved' | 'rejected', notes?: string): Promise<WithdrawalRequest> {
    const request = this.withdrawalRequests.get(id);
    if (!request) {
      throw new Error(`Withdrawal request with ID ${id} not found`);
    }
    
    // If rejecting a previously non-rejected request, return points to user
    if (status === 'rejected' && request.status !== 'rejected') {
      const user = this.users.get(request.userId);
      if (user) {
        // Add points log entry for the returned points
        this.addPointsLog({
          userId: user.id,
          points: request.amount, // Positive value for points returned
          action: 'withdrawal_rejected',
          description: `Returned points from rejected withdrawal: ${request.amount} points (${request.method})`
        });
        
        // Note: No need to manually update user points as addPointsLog handles that already
      }
    }
    
    // Update the request
    const updatedRequest: WithdrawalRequest = {
      ...request,
      status,
      processedAt: new Date(),
      notes: notes || null
    };
    
    this.withdrawalRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  // Check-in operations
  async getUserCheckIns(userId: number): Promise<CheckIn[]> {
    return Array.from(this.checkIns.values())
      .filter(checkIn => checkIn.userId === userId)
      .sort((a, b) => new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime());
  }
  
  async getUserCurrentStreak(userId: number): Promise<{
    currentStreak: number;
    lastCheckIn: string | null;
    canCheckInNow: boolean;
    nextCheckInTime: string | null;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Current streak is stored directly on the user
    const currentStreak = user.currentStreak || 0;
    const lastCheckIn = user.lastCheckIn ? new Date(user.lastCheckIn) : null;
    
    // Determine if user can check in now
    const now = new Date();
    let canCheckInNow = false;
    let nextCheckInTime = null;
    
    if (!lastCheckIn) {
      // If never checked in before, they can check in now
      canCheckInNow = true;
      nextCheckInTime = now;
    } else {
      // Calculate the time difference from last check-in
      const hoursSinceLastCheckIn = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastCheckIn >= 24) {
        // Can check in if at least 24 hours have passed
        canCheckInNow = true;
        nextCheckInTime = now;
      } else {
        // Need to wait longer
        canCheckInNow = false;
        nextCheckInTime = new Date(lastCheckIn.getTime() + (24 * 60 * 60 * 1000));
      }
    }
    
    return {
      currentStreak,
      lastCheckIn: lastCheckIn ? lastCheckIn.toISOString() : null,
      canCheckInNow,
      nextCheckInTime: nextCheckInTime ? nextCheckInTime.toISOString() : null
    };
  }
  
  async processUserCheckIn(userId: number): Promise<{
    success: boolean;
    points: number;
    newStreak: number;
    nextCheckInTime: string;
    message: string;
  }> {
    // Check if user exists
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Get current streak info
    const streakInfo = await this.getUserCurrentStreak(userId);
    
    // If can't check in now, return early
    if (!streakInfo.canCheckInNow) {
      return {
        success: false,
        points: 0,
        newStreak: streakInfo.currentStreak,
        nextCheckInTime: streakInfo.nextCheckInTime!, 
        message: "You can't check in yet. Please try again later."
      };
    }
    
    // Determine new streak value and points to award
    let newStreak = 1; // Start with 1 if streak is broken or no streak
    const now = new Date();
    
    if (streakInfo.lastCheckIn) {
      // Check if this is a continuation of a streak (less than 48 hours since last check-in)
      const lastCheckInDate = new Date(streakInfo.lastCheckIn);
      const hoursSinceLastCheckIn = (now.getTime() - lastCheckInDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastCheckIn < 48) {
        // Continuing streak
        newStreak = streakInfo.currentStreak + 1;
      }
    }
    
    // Determine points to award based on streak day
    const streakDay = newStreak % 7 || 7; // Convert 0 to 7 for the 7th day
    const points = streakDay === 7 ? 10 : 5; // 10 points on 7th day, 5 on other days
    
    // Create a record of this check-in
    const checkIn: CheckIn = {
      id: this.currentCheckInId++,
      userId,
      checkedInAt: now,
      streakDay,
      pointsEarned: points
    };
    
    this.checkIns.set(checkIn.id, checkIn);
    
    // Add entry to points log instead of directly updating points
    const action = streakDay === 7 ? 'streak_complete' : 'daily_check_in';
    const description = streakDay === 7 
      ? `Completed 7-day streak` 
      : `Daily check-in (day ${streakDay})`;
    
    await this.addPointsLog({
      userId,
      points,
      action,
      description
    });
    
    // Update user's streak and last check-in (points are handled by addPointsLog)
    const updatedUser: User = {
      ...user,
      currentStreak: newStreak,
      lastCheckIn: now
    };
    
    this.users.set(userId, updatedUser);
    
    // Calculate next check-in time (24 hours from now)
    const nextCheckInTime = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    
    return {
      success: true,
      points,
      newStreak,
      nextCheckInTime: nextCheckInTime.toISOString(),
      message: `You earned ${points} points! Your current streak is ${newStreak} day${newStreak !== 1 ? 's' : ''}.`
    };
  }
  
  async processUserSpin(userId: number): Promise<{
    success: boolean;
    points: number;
    nextSpinTime: string;
    message: string;
  }> {
    // Check if user exists
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const now = new Date();
    
    // Check if user can spin (if they have lastSpin field and it's less than 24 hours ago, they can't spin)
    if (user.lastSpin) {
      const lastSpinDate = new Date(user.lastSpin);
      const hoursSinceLastSpin = (now.getTime() - lastSpinDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastSpin < 24) {
        // User needs to wait before spinning again
        const nextSpinTime = new Date(lastSpinDate.getTime() + (24 * 60 * 60 * 1000));
        return {
          success: false,
          points: 0,
          nextSpinTime: nextSpinTime.toISOString(),
          message: "You can't spin yet. Please try again later."
        };
      }
    }
    
    // User can spin! Determine random points award (1-5)
    const points = Math.floor(Math.random() * 5) + 1; // Random integer between 1 and 5
    
    // Add entry to points log
    await this.addPointsLog({
      userId,
      points,
      action: 'spin_wheel',
      description: `Spin the wheel reward: ${points} points`
    });
    
    // Update user's last spin time
    const updatedUser: User = {
      ...user,
      lastSpin: now
    };
    
    this.users.set(userId, updatedUser);
    
    // Calculate next spin time (24 hours from now)
    const nextSpinTime = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    
    return {
      success: true,
      points,
      nextSpinTime: nextSpinTime.toISOString(),
      message: `Congratulations! You spun the wheel and earned ${points} points!`
    };
  }
  
  // Banner ad operations
  async getBannerAds(options?: { 
    location?: string, 
    isActive?: boolean 
  }): Promise<BannerAd[]> {
    let bannerAds = Array.from(this.bannerAds.values());
    
    // Apply filters
    if (options?.location) {
      bannerAds = bannerAds.filter(ad => ad.location === options.location);
    }
    
    if (options?.isActive !== undefined) {
      bannerAds = bannerAds.filter(ad => ad.isActive === options.isActive);
    }
    
    return bannerAds;
  }
  
  async getBannerAdById(id: number): Promise<BannerAd | undefined> {
    return this.bannerAds.get(id);
  }
  
  async createBannerAd(bannerAd: InsertBannerAd): Promise<BannerAd> {
    const id = this.currentBannerAdId++;
    const now = new Date();
    
    const newBannerAd: BannerAd = {
      ...bannerAd,
      id,
      createdAt: now,
      updatedAt: now,
      isActive: bannerAd.isActive !== undefined ? bannerAd.isActive : true
    };
    
    this.bannerAds.set(id, newBannerAd);
    return newBannerAd;
  }
  
  async updateBannerAd(bannerAd: BannerAd): Promise<BannerAd> {
    const existing = await this.getBannerAdById(bannerAd.id);
    if (!existing) {
      throw new Error(`Banner ad with ID ${bannerAd.id} not found`);
    }
    
    const updatedBannerAd: BannerAd = {
      ...bannerAd,
      updatedAt: new Date()
    };
    
    this.bannerAds.set(bannerAd.id, updatedBannerAd);
    return updatedBannerAd;
  }
  
  async toggleBannerAdStatus(id: number): Promise<BannerAd> {
    const bannerAd = await this.getBannerAdById(id);
    if (!bannerAd) {
      throw new Error(`Banner ad with ID ${id} not found`);
    }
    
    const updatedBannerAd: BannerAd = {
      ...bannerAd,
      isActive: !bannerAd.isActive,
      updatedAt: new Date()
    };
    
    this.bannerAds.set(id, updatedBannerAd);
    return updatedBannerAd;
  }
  
  async deleteBannerAd(id: number): Promise<void> {
    const bannerAd = await this.getBannerAdById(id);
    if (!bannerAd) {
      throw new Error(`Banner ad with ID ${id} not found`);
    }
    
    this.bannerAds.delete(id);
  }
  
  // Newsletter subscriber operations
  async getAllSubscribers(): Promise<Subscriber[]> {
    return Array.from(this.subscribers.values());
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return Array.from(this.subscribers.values()).find(
      (subscriber) => subscriber.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createSubscriber(data: InsertSubscriber): Promise<Subscriber | undefined> {
    const id = this.currentSubscriberId++;
    const now = new Date();
    const subscriber: Subscriber = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.subscribers.set(id, subscriber);
    return subscriber;
  }

  async updateSubscriber(id: number, data: Partial<InsertSubscriber>): Promise<Subscriber | undefined> {
    const existing = this.subscribers.get(id);
    if (!existing) {
      return undefined;
    }

    const now = new Date();
    const updatedSubscriber: Subscriber = {
      ...existing,
      ...data,
      updatedAt: now
    };
    
    this.subscribers.set(id, updatedSubscriber);
    return updatedSubscriber;
  }

  async deleteSubscriber(id: number): Promise<boolean> {
    const existing = this.subscribers.get(id);
    if (!existing) {
      return false;
    }
    
    this.subscribers.delete(id);
    return true;
  }
  
  // Social media links operations
  async getAllSocialMediaLinks(): Promise<SocialMediaLink[]> {
    return Array.from(this.socialMediaLinks.values());
  }
  
  async getSocialMediaLinkById(id: number): Promise<SocialMediaLink | undefined> {
    return this.socialMediaLinks.get(id);
  }
  
  async createSocialMediaLink(data: InsertSocialMediaLink): Promise<SocialMediaLink> {
    const id = this.currentSocialMediaLinkId++;
    const now = new Date();
    const socialMediaLink: SocialMediaLink = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      isActive: data.isActive !== undefined ? data.isActive : true
    };
    this.socialMediaLinks.set(id, socialMediaLink);
    return socialMediaLink;
  }
  
  async updateSocialMediaLink(id: number, data: Partial<InsertSocialMediaLink>): Promise<SocialMediaLink> {
    const socialMediaLink = this.socialMediaLinks.get(id);
    if (!socialMediaLink) {
      throw new Error(`Social media link with ID ${id} not found`);
    }
    
    const now = new Date();
    const updatedSocialMediaLink: SocialMediaLink = {
      ...socialMediaLink,
      ...data,
      updatedAt: now
    };
    this.socialMediaLinks.set(id, updatedSocialMediaLink);
    return updatedSocialMediaLink;
  }
  
  async toggleSocialMediaLinkStatus(id: number): Promise<SocialMediaLink> {
    const socialMediaLink = this.socialMediaLinks.get(id);
    if (!socialMediaLink) {
      throw new Error(`Social media link with ID ${id} not found`);
    }
    
    const now = new Date();
    const updatedSocialMediaLink: SocialMediaLink = {
      ...socialMediaLink,
      isActive: !socialMediaLink.isActive,
      updatedAt: now
    };
    this.socialMediaLinks.set(id, updatedSocialMediaLink);
    return updatedSocialMediaLink;
  }
  
  async deleteSocialMediaLink(id: number): Promise<boolean> {
    const exists = this.socialMediaLinks.has(id);
    if (!exists) {
      return false;
    }
    this.socialMediaLinks.delete(id);
    return true;
  }
}

// Database-backed storage implementation
import { eq, and, desc, sql, asc, like, or, isNull, inArray } from "drizzle-orm";
import { db } from "./db";

export class DatabaseStorage implements IStorage {
  private initialized: boolean = false;
  
  // Points log operations
  async getPointsLog(userId: number): Promise<PointsLog[]> {
    const logs = await db
      .select()
      .from(pointsLog)
      .where(eq(pointsLog.userId, userId))
      .orderBy(desc(pointsLog.createdAt));
    
    return logs;
  }
  
  async addPointsLog(insertLog: InsertPointsLog): Promise<PointsLog> {
    // Insert the points log entry
    const [log] = await db
      .insert(pointsLog)
      .values(insertLog)
      .returning();
    
    // Update the user's points balance
    const user = await this.getUser(insertLog.userId);
    if (user) {
      const currentPoints = user.points || 0;
      await db
        .update(users)
        .set({ points: currentPoints + insertLog.points })
        .where(eq(users.id, insertLog.userId));
    }
    
    return log;
  }
  
  async getUserPointsBalance(userId: number): Promise<number> {
    // Get the user's points from the users table
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    // Return the points value from the user record
    return user?.points || 0;
  }
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return undefined;
    }
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
      return user;
    } catch (error) {
      console.error("Error getting user by firebaseUid:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(user: Partial<User> & { id: number }): Promise<User> {
    try {
      console.log("DatabaseStorage updating user:", user);
      const [updatedUser] = await db
        .update(users)
        .set(user)
        .where(eq(users.id, user.id))
        .returning();
      
      console.log("User updated in database:", updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await db.delete(users).where(eq(users.id, id));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }

  async updateUserPreferences(userId: number, preferences: { 
    preferredCategories?: number[], 
    preferredStores?: number[],
    hasCompletedOnboarding?: boolean
  }): Promise<User> {
    try {
      const updateData: Partial<User> = { id: userId };
      
      if (preferences.preferredCategories !== undefined) {
        updateData.preferredCategories = preferences.preferredCategories;
      }
      
      if (preferences.preferredStores !== undefined) {
        updateData.preferredStores = preferences.preferredStores;
      }
      
      if (preferences.hasCompletedOnboarding !== undefined) {
        updateData.hasCompletedOnboarding = preferences.hasCompletedOnboarding;
      }
      
      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();
      
      return updatedUser;
    } catch (error) {
      console.error("Error updating user preferences:", error);
      throw error;
    }
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    try {
      return await db.select().from(categories);
    } catch (error) {
      console.error("Error getting categories:", error);
      return [];
    }
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    try {
      const [category] = await db.select().from(categories).where(eq(categories.id, id));
      return category;
    } catch (error) {
      console.error("Error getting category by ID:", error);
      return undefined;
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    try {
      const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
      return category;
    } catch (error) {
      console.error("Error getting category by slug:", error);
      return undefined;
    }
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    try {
      const [category] = await db.insert(categories).values(insertCategory).returning();
      return category;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  async updateCategory(category: Category): Promise<Category> {
    try {
      const [updatedCategory] = await db
        .update(categories)
        .set(category)
        .where(eq(categories.id, category.id))
        .returning();
      
      return updatedCategory;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<void> {
    try {
      await db.delete(categories).where(eq(categories.id, id));
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }

  // Store operations
  async getStores(): Promise<Store[]> {
    try {
      return await db.select().from(stores);
    } catch (error) {
      console.error("Error getting stores:", error);
      return [];
    }
  }

  async getStoreById(id: number): Promise<Store | undefined> {
    try {
      const [store] = await db.select().from(stores).where(eq(stores.id, id));
      return store;
    } catch (error) {
      console.error("Error getting store by ID:", error);
      return undefined;
    }
  }

  async getStoreBySlug(slug: string): Promise<Store | undefined> {
    try {
      const [store] = await db.select().from(stores).where(eq(stores.slug, slug));
      return store;
    } catch (error) {
      console.error("Error getting store by slug:", error);
      return undefined;
    }
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    try {
      const [store] = await db.insert(stores).values(insertStore).returning();
      return store;
    } catch (error) {
      console.error("Error creating store:", error);
      throw error;
    }
  }

  async updateStore(store: Store): Promise<Store> {
    try {
      const [updatedStore] = await db
        .update(stores)
        .set(store)
        .where(eq(stores.id, store.id))
        .returning();
      
      return updatedStore;
    } catch (error) {
      console.error("Error updating store:", error);
      throw error;
    }
  }

  async deleteStore(id: number): Promise<void> {
    try {
      await db.delete(stores).where(eq(stores.id, id));
    } catch (error) {
      console.error("Error deleting store:", error);
      throw error;
    }
  }

  // Coupon operations
  async getCoupons(options?: { 
    categoryId?: number, 
    storeId?: number, 
    featured?: boolean, 
    search?: string,
    sortBy?: 'newest' | 'expiring' | 'popular'
  }): Promise<CouponWithRelations[]> {
    try {
      let query = db.select().from(coupons)
        .leftJoin(stores, eq(coupons.storeId, stores.id))
        .leftJoin(categories, eq(coupons.categoryId, categories.id));
      
      // Apply filters
      const filters = [];
      
      if (options?.categoryId) {
        filters.push(eq(coupons.categoryId, options.categoryId));
      }
      
      if (options?.storeId) {
        filters.push(eq(coupons.storeId, options.storeId));
      }
      
      if (options?.featured !== undefined) {
        filters.push(eq(coupons.featured, options.featured));
      }
      
      if (options?.search) {
        // Create a more focused fuzzy search on the most important fields
        const searchTerm = `%${options.search}%`;
        console.log(`DEBUG: Search term for SQL query: "${searchTerm}"`);
        
        // Use SQL LOWER function to make case-insensitive search
        filters.push(
          or(
            sql`LOWER(${coupons.title}) LIKE LOWER(${searchTerm})`,
            sql`LOWER(${coupons.description}) LIKE LOWER(${searchTerm})`,
            sql`LOWER(${stores.name}) LIKE LOWER(${searchTerm})`
          )
        );
        
        console.log('DEBUG: Applied case-insensitive search filter');
      }
      
      if (filters.length > 0) {
        query = query.where(and(...filters));
      }
      
      // Apply sorting
      if (options?.sortBy === 'newest') {
        query = query.orderBy(desc(coupons.id));
      } else if (options?.sortBy === 'expiring') {
        query = query.orderBy(asc(coupons.expiresAt));
      } else if (options?.sortBy === 'popular') {
        query = query.orderBy(desc(coupons.usedCount));
      } else {
        // Default sort by newest
        query = query.orderBy(desc(coupons.id));
      }
      
      // Handle store name searches more directly
      if (options?.search) {
        const searchTermLower = options.search.toLowerCase();
        console.log(`DEBUG: Checking if search "${searchTermLower}" matches a store name directly`);
        
        // Find any store that matches the search term (case-insensitive)
        const matchingStores = await db.select()
          .from(stores)
          .where(sql`LOWER(${stores.name}) = ${searchTermLower}`);
          
        console.log(`DEBUG: Found ${matchingStores.length} stores matching name "${searchTermLower}" exactly`);
        
        // If we found a matching store, look up all coupons for that store
        if (matchingStores.length > 0) {
          const storeId = matchingStores[0].id;
          console.log(`DEBUG: Getting coupons for store ID ${storeId} (${matchingStores[0].name})`);
          
          const storeCoupons = await db.select()
            .from(coupons)
            .leftJoin(stores, eq(coupons.storeId, stores.id))
            .leftJoin(categories, eq(coupons.categoryId, categories.id))
            .where(eq(coupons.storeId, storeId));
            
          console.log(`DEBUG: Found ${storeCoupons.length} coupons for store ID ${storeId}`);
          
          // If we found coupons, return them
          if (storeCoupons.length > 0) {
            // Transform to expected format
            const formattedStoreCoupons = storeCoupons.map(row => ({
              ...row.coupons,
              store: row.stores,
              category: row.categories
            }));
            
            console.log(`DEBUG: Returning ${formattedStoreCoupons.length} coupons for ${matchingStores[0].name}`);
            return formattedStoreCoupons;
          }
        }
      }
      
      // Extract the SQL query being run for debugging
      const querySQL = query.toSQL();
      console.log('DEBUG: SQL Query being executed:', querySQL.sql, 'with params:', querySQL.params);

      const results = await query;
      console.log(`DEBUG: Raw query results for coupons:`, 
                 JSON.stringify(results.slice(0, 1), null, 2), // just show first result to avoid huge log
                 `... and ${results.length-1} more results`);
      
      // Transform results to expected CouponWithRelations format
      const formattedResults = results.map(row => ({
        ...row.coupons,
        store: row.stores,
        category: row.categories
      }));
      
      console.log(`DEBUG: Returning ${formattedResults.length} coupons`);
      return formattedResults;
    } catch (error) {
      console.error("Error getting coupons:", error);
      return [];
    }
  }

  async getCouponById(id: number): Promise<CouponWithRelations | undefined> {
    try {
      const [result] = await db.select()
        .from(coupons)
        .leftJoin(stores, eq(coupons.storeId, stores.id))
        .leftJoin(categories, eq(coupons.categoryId, categories.id))
        .where(eq(coupons.id, id));
      
      if (!result) return undefined;
      
      return {
        ...result.coupons,
        store: result.stores,
        category: result.categories
      };
    } catch (error) {
      console.error("Error getting coupon by ID:", error);
      return undefined;
    }
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    try {
      const [coupon] = await db.insert(coupons).values(insertCoupon).returning();
      return coupon;
    } catch (error) {
      console.error("Error creating coupon:", error);
      throw error;
    }
  }

  async updateCoupon(coupon: Coupon): Promise<Coupon> {
    try {
      const [updatedCoupon] = await db
        .update(coupons)
        .set(coupon)
        .where(eq(coupons.id, coupon.id))
        .returning();
      
      return updatedCoupon;
    } catch (error) {
      console.error("Error updating coupon:", error);
      throw error;
    }
  }

  async deleteCoupon(id: number): Promise<void> {
    try {
      await db.delete(coupons).where(eq(coupons.id, id));
    } catch (error) {
      console.error("Error deleting coupon:", error);
      throw error;
    }
  }

  async incrementCouponUsage(id: number): Promise<void> {
    try {
      await db
        .update(coupons)
        .set({
          usedCount: sql`${coupons.usedCount} + 1`
        })
        .where(eq(coupons.id, id));
    } catch (error) {
      console.error("Error incrementing coupon usage:", error);
      throw error;
    }
  }
  
  // Initialize demo data if needed
  async ensureDemoData() {
    if (this.initialized) return;
    
    console.log("Checking if demo data needs to be initialized...");
    
    try {
      // Check if we have stores
      const existingStores = await db.select().from(stores);
      if (existingStores.length === 0) {
        console.log("No stores found, creating demo stores...");
        
        // Create demo stores
        const demoStores = [
          {
            name: "Amazon",
            slug: "amazon",
            website: "https://www.amazon.com",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/320px-Amazon_logo.svg.png",
            description: "Online retailer of books, movies, music and games, electronics, computers, software, apparel & accessories, shoes, and more.",
            metaTitle: "Amazon Coupons & Promo Codes",
            metaDescription: "Save with the latest Amazon promo codes, coupons and deals. Updated daily.",
            metaKeywords: "amazon, coupons, promo codes, deals, discount"
          },
          {
            name: "Best Buy",
            slug: "best-buy",
            website: "https://www.bestbuy.com",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Best_Buy_Logo.svg/320px-Best_Buy_Logo.svg.png",
            description: "Retailer of consumer electronics, computers, mobile phones, video games, and appliances.",
            metaTitle: "Best Buy Coupons & Deals",
            metaDescription: "Find the latest Best Buy coupons, promo codes and deals. Save on electronics, appliances, and more.",
            metaKeywords: "best buy, electronics, coupons, deals, promo codes"
          },
          {
            name: "Target",
            slug: "target",
            website: "https://www.target.com",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Target_Corporation_logo_%28vector%29.svg/320px-Target_Corporation_logo_%28vector%29.svg.png",
            description: "Retailer providing high-quality, on-trend merchandise at attractive prices in clean, spacious and guest-friendly stores.",
            metaTitle: "Target Coupons, Promo Codes & Deals",
            metaDescription: "Find the latest Target coupons, discount codes and deals. Save on clothing, electronics, home goods and more.",
            metaKeywords: "target, coupons, promo codes, deals, discount"
          }
        ];
        
        for (const store of demoStores) {
          await db.insert(stores).values(store);
        }
        console.log("Created demo stores successfully");
      }
      
      // Check if we have categories
      const existingCategories = await db.select().from(categories);
      if (existingCategories.length === 0) {
        console.log("No categories found, creating demo categories...");
        
        // Create demo categories
        const demoCategories = [
          {
            name: "Electronics",
            slug: "electronics",
            description: "Find the best deals on electronics including TVs, computers, smartphones, and more.",
            icon: "laptop",
            metaTitle: "Electronics Coupons & Deals",
            metaDescription: "Save big on electronics with our exclusive coupons and promo codes. Find deals on TVs, computers, smartphones, and more.",
            metaKeywords: "electronics, coupons, deals, tech, gadgets"
          },
          {
            name: "Clothing",
            slug: "clothing",
            description: "Save on the latest fashion trends with clothing coupons and promo codes.",
            icon: "shirt",
            metaTitle: "Clothing & Fashion Coupons",
            metaDescription: "Get discounts on clothing and fashion with our exclusive coupons. Save on shoes, accessories, and apparel.",
            metaKeywords: "clothing, fashion, coupons, apparel, shoes"
          },
          {
            name: "Home & Garden",
            slug: "home-garden",
            description: "Furnish and decorate your home for less with our home & garden coupons.",
            icon: "home",
            metaTitle: "Home & Garden Discount Codes",
            metaDescription: "Find the best deals on furniture, home decor, and garden supplies with our exclusive discount codes.",
            metaKeywords: "home, garden, furniture, decor, coupons"
          }
        ];
        
        for (const category of demoCategories) {
          await db.insert(categories).values(category);
        }
        console.log("Created demo categories successfully");
      }
      
      this.initialized = true;
    } catch (error) {
      console.error("Error initializing demo data:", error);
    }
  }

  // Statistics
  async getStoreWithCouponCount(): Promise<(Store & { couponCount: number })[]> {
    try {
      // Ensure we have demo data
      await this.ensureDemoData();
      
      const storesList = await db.select().from(stores);
      console.log(`Found ${storesList.length} stores in database`);
      
      return Promise.all(storesList.map(async (store) => {
        try {
          const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(coupons)
            .where(eq(coupons.storeId, store.id));
            
          return {
            ...store,
            couponCount: Number(result[0]?.count || 0)
          };
        } catch (err) {
          console.error(`Error getting coupon count for store ${store.id}:`, err);
          return {
            ...store,
            couponCount: 0
          };
        }
      }));
    } catch (error) {
      console.error("Error getting store with coupon count:", error);
      return [];
    }
  }

  async getCategoryWithCouponCount(): Promise<(Category & { couponCount: number })[]> {
    try {
      // Ensure we have demo data
      await this.ensureDemoData();
      
      const categoriesList = await db.select().from(categories);
      console.log(`Found ${categoriesList.length} categories in database`);
      
      return Promise.all(categoriesList.map(async (category) => {
        try {
          const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(coupons)
            .where(eq(coupons.categoryId, category.id));
            
          return {
            ...category,
            couponCount: Number(result[0]?.count || 0)
          };
        } catch (err) {
          console.error(`Error getting coupon count for category ${category.id}:`, err);
          return {
            ...category,
            couponCount: 0
          };
        }
      }));
    } catch (error) {
      console.error("Error getting category with coupon count:", error);
      return [];
    }
  }
  
  // Heat map data
  async getCouponUsageByCategory(): Promise<{ category: string; usageCount: number; coupons: number }[]> {
    try {
      // Ensure we have demo data
      await this.ensureDemoData();
      
      const categoriesList = await db.select().from(categories);
      console.log(`Found ${categoriesList.length} categories for heat map`);
      
      return Promise.all(categoriesList.map(async (category) => {
        try {
          const couponsResult = await db
            .select()
            .from(coupons)
            .where(eq(coupons.categoryId, category.id));
            
          const usageCount = couponsResult.reduce((sum, coupon) => sum + (Number(coupon.usedCount) || 0), 0);
          
          return {
            category: category.name,
            usageCount,
            coupons: couponsResult.length
          };
        } catch (err) {
          console.error(`Error getting coupon usage for category ${category.id}:`, err);
          return {
            category: category.name,
            usageCount: 0,
            coupons: 0
          };
        }
      }));
    } catch (error) {
      console.error("Error getting coupon usage by category:", error);
      return [];
    }
  }

  async getCouponUsageByMonth(): Promise<{ month: string; usageCount: number; coupons: number }[]> {
    try {
      // For simplicity, we'll generate sample data for last 6 months
      const allCoupons = await db.select().from(coupons);
      
      // Get current date and last 6 months
      const currentDate = new Date();
      const months = [];
      for (let i = 0; i < 6; i++) {
        const monthDate = new Date(currentDate);
        monthDate.setMonth(currentDate.getMonth() - i);
        months.push({
          name: monthDate.toLocaleString('default', { month: 'long' }),
          year: monthDate.getFullYear(),
          monthNumber: monthDate.getMonth()
        });
      }
      
      // Group coupons by creation month
      const monthlyData = months.map(month => {
        const monthCoupons = allCoupons.filter(coupon => {
          const couponDate = new Date(coupon.expiresAt);
          return couponDate.getMonth() === month.monthNumber && 
                couponDate.getFullYear() === month.year;
        });
        
        const usageCount = monthCoupons.reduce((sum, coupon) => sum + (coupon.usedCount || 0), 0);
        
        return {
          month: `${month.name} ${month.year}`,
          usageCount,
          coupons: monthCoupons.length
        };
      });
      
      return monthlyData;
    } catch (error) {
      console.error("Error getting coupon usage by month:", error);
      return [];
    }
  }
  
  // User-submitted coupon operations
  async getUserSubmittedCoupons(options?: {
    userId?: number,
    status?: 'pending' | 'approved' | 'rejected',
    sortBy?: 'newest'
  }): Promise<UserSubmittedCouponWithRelations[]> {
    try {
      let query = db.select()
        .from(userSubmittedCoupons)
        .leftJoin(stores, eq(userSubmittedCoupons.storeId, stores.id))
        .leftJoin(categories, eq(userSubmittedCoupons.categoryId, categories.id))
        .leftJoin(users, eq(userSubmittedCoupons.userId, users.id));
      
      // Apply filters
      const filters = [];
      
      if (options?.userId) {
        filters.push(eq(userSubmittedCoupons.userId, options.userId));
      }
      
      if (options?.status) {
        filters.push(eq(userSubmittedCoupons.status, options.status));
      }
      
      if (filters.length > 0) {
        query = query.where(and(...filters));
      }
      
      // Apply sorting
      if (options?.sortBy === 'newest') {
        query = query.orderBy(desc(userSubmittedCoupons.submittedAt));
      } else {
        // Default sort by newest
        query = query.orderBy(desc(userSubmittedCoupons.submittedAt));
      }
      
      const results = await query;
      
      // Transform results to expected UserSubmittedCouponWithRelations format
      return results.map(row => ({
        ...row.user_submitted_coupons,
        store: row.stores,
        category: row.categories,
        user: row.users
      }));
    } catch (error) {
      console.error("Error getting user submitted coupons:", error);
      return [];
    }
  }

  async getUserSubmittedCouponById(id: number): Promise<UserSubmittedCouponWithRelations | undefined> {
    try {
      const [result] = await db.select()
        .from(userSubmittedCoupons)
        .leftJoin(stores, eq(userSubmittedCoupons.storeId, stores.id))
        .leftJoin(categories, eq(userSubmittedCoupons.categoryId, categories.id))
        .leftJoin(users, eq(userSubmittedCoupons.userId, users.id))
        .where(eq(userSubmittedCoupons.id, id));
      
      if (!result) return undefined;
      
      return {
        ...result.user_submitted_coupons,
        store: result.stores,
        category: result.categories,
        user: result.users
      };
    } catch (error) {
      console.error("Error getting user submitted coupon by ID:", error);
      return undefined;
    }
  }

  async createUserSubmittedCoupon(insertCoupon: InsertUserSubmittedCoupon): Promise<UserSubmittedCoupon> {
    try {
      const formattedData = {
        userId: insertCoupon.userId,
        title: insertCoupon.title,
        description: insertCoupon.description,
        code: insertCoupon.code,
        storeId: Number(insertCoupon.storeId),
        categoryId: Number(insertCoupon.categoryId),
        expiresAt: new Date(insertCoupon.expiresAt),
        terms: insertCoupon.terms || null,
        status: 'pending',
        submittedAt: new Date(),
        reviewedAt: null,
        reviewNotes: null
      };
      
      console.log("Inserting user-submitted coupon:", formattedData);
      
      // Use drizzle to insert the coupon
      const [coupon] = await db
        .insert(userSubmittedCoupons)
        .values(formattedData)
        .returning();

      if (!coupon) {
        throw new Error("Failed to create coupon - no coupon returned");
      }

      return coupon;
    } catch (error) {
      console.error("Error creating user-submitted coupon:", error);
      throw new Error("Failed to create user-submitted coupon");
    }
  }

  async updateUserSubmittedCoupon(coupon: UserSubmittedCoupon): Promise<UserSubmittedCoupon> {
    try {
      const [updatedCoupon] = await db
        .update(userSubmittedCoupons)
        .set(coupon)
        .where(eq(userSubmittedCoupons.id, coupon.id))
        .returning();
      
      return updatedCoupon;
    } catch (error) {
      console.error("Error updating user submitted coupon:", error);
      throw error;
    }
  }

  async updateUserSubmittedCouponStatus(id: number, status: 'approved' | 'rejected', reviewNotes?: string): Promise<UserSubmittedCoupon> {
    try {
      const [updatedCoupon] = await db
        .update(userSubmittedCoupons)
        .set({
          status,
          reviewedAt: new Date(),
          reviewNotes: reviewNotes || null
        })
        .where(eq(userSubmittedCoupons.id, id))
        .returning();
      
      // If coupon is approved, award 5 points to the user
      if (status === 'approved') {
        // Get the coupon details to find the user ID
        const coupon = await this.getUserSubmittedCouponById(id);
        if (coupon) {
          // Get the user
          const user = await this.getUser(coupon.userId);
          if (user) {
            // Add 5 points to the user's current points total
            await this.updateUser({
              id: user.id,
              points: (user.points || 0) + 5
            });
            console.log(`Added 5 points to user ${user.id} for approved coupon submission`);
          }
        }
      }
      
      return updatedCoupon;
    } catch (error) {
      console.error("Error updating user submitted coupon status:", error);
      throw error;
    }
  }

  async deleteUserSubmittedCoupon(id: number): Promise<void> {
    try {
      await db.delete(userSubmittedCoupons).where(eq(userSubmittedCoupons.id, id));
    } catch (error) {
      console.error("Error deleting user submitted coupon:", error);
      throw error;
    }
  }

  // Withdrawal requests implementation
  async getWithdrawalRequests(options?: {
    userId?: number,
    status?: 'pending' | 'approved' | 'rejected'
  }): Promise<WithdrawalRequestWithUser[]> {
    try {
      let query = db.select({
        withdrawal: withdrawalRequests,
        user: users
      })
      .from(withdrawalRequests)
      .innerJoin(users, eq(withdrawalRequests.userId, users.id));
      
      if (options?.userId) {
        query = query.where(eq(withdrawalRequests.userId, options.userId));
      }
      
      if (options?.status) {
        query = query.where(eq(withdrawalRequests.status, options.status));
      }
      
      // Sort by newest first
      query = query.orderBy(desc(withdrawalRequests.requestedAt));
      
      const results = await query;
      
      return results.map(({ withdrawal, user }) => ({
        ...withdrawal,
        user
      }));
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
      return [];
    }
  }
  
  async getWithdrawalRequestById(id: number): Promise<WithdrawalRequestWithUser | undefined> {
    try {
      const [result] = await db.select({
        withdrawal: withdrawalRequests,
        user: users
      })
      .from(withdrawalRequests)
      .innerJoin(users, eq(withdrawalRequests.userId, users.id))
      .where(eq(withdrawalRequests.id, id));
      
      if (!result) return undefined;
      
      return {
        ...result.withdrawal,
        user: result.user
      };
    } catch (error) {
      console.error("Error fetching withdrawal request:", error);
      return undefined;
    }
  }
  
  async createWithdrawalRequest(request: InsertWithdrawalRequest): Promise<WithdrawalRequest> {
    try {
      // Ensure user exists and has sufficient points
      const user = await this.getUser(request.userId);
      if (!user) {
        throw new Error(`User with ID ${request.userId} not found`);
      }
      
      if ((user.points || 0) < request.amount) {
        throw new Error(`Insufficient points. User has ${user.points} points, requested ${request.amount}`);
      }
      
      // Insert the withdrawal request
      const [withdrawalRequest] = await db
        .insert(withdrawalRequests)
        .values({
          ...request,
          status: 'pending',
          requestedAt: new Date(),
          processedAt: null,
          notes: null
        })
        .returning();
      
      // Create a points log entry (negative points for withdrawal)
      await this.addPointsLog({
        userId: user.id,
        points: -request.amount, // Use negative value for deduction
        action: 'withdrawal_request',
        description: `Withdrawal request for ${request.amount} points (${request.method})`
      });
      
      // Note: No need to manually deduct points as addPointsLog already updates the user's points balance
      
      return withdrawalRequest;
    } catch (error) {
      console.error("Error creating withdrawal request:", error);
      throw error;
    }
  }
  
  async updateWithdrawalRequestStatus(id: number, status: 'approved' | 'rejected', notes?: string): Promise<WithdrawalRequest> {
    try {
      const withdrawalRequest = await db
        .select()
        .from(withdrawalRequests)
        .where(eq(withdrawalRequests.id, id))
        .then(rows => rows[0]);
      
      if (!withdrawalRequest) {
        throw new Error(`Withdrawal request with ID ${id} not found`);
      }
      
      // If rejecting a request, return the points to the user
      if (status === 'rejected' && withdrawalRequest.status !== 'rejected') {
        const user = await this.getUser(withdrawalRequest.userId);
        if (user) {
          // Add points log entry for the points being returned
          await this.addPointsLog({
            userId: user.id,
            points: withdrawalRequest.amount, // Positive value for points returned
            action: 'withdrawal_rejected',
            description: `Returned points from rejected withdrawal: ${withdrawalRequest.amount} points (${withdrawalRequest.method})`
          });
          
          // Note: The addPointsLog method already updates the user's points balance
        }
      }
      
      // Update the withdrawal request status
      const [updatedRequest] = await db
        .update(withdrawalRequests)
        .set({
          status,
          processedAt: new Date(),
          notes: notes || null
        })
        .where(eq(withdrawalRequests.id, id))
        .returning();
      
      return updatedRequest;
    } catch (error) {
      console.error("Error updating withdrawal request status:", error);
      throw error;
    }
  }
  
  // Check-in operations
  async getUserCheckIns(userId: number): Promise<CheckIn[]> {
    try {
      const userCheckIns = await db
        .select()
        .from(checkIns)
        .where(eq(checkIns.userId, userId))
        .orderBy(desc(checkIns.checkedInAt));
      
      return userCheckIns;
    } catch (error) {
      console.error("Error getting user check-ins:", error);
      return [];
    }
  }
  
  async getUserCurrentStreak(userId: number): Promise<{
    currentStreak: number;
    lastCheckIn: string | null;
    canCheckInNow: boolean;
    nextCheckInTime: string | null;
  }> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      // Get streak info from user record
      const currentStreak = user.currentStreak || 0;
      const lastCheckIn = user.lastCheckIn ? new Date(user.lastCheckIn) : null;
      
      // Determine if user can check in now
      const now = new Date();
      let canCheckInNow = false;
      let nextCheckInTime = null;
      
      if (!lastCheckIn) {
        // If never checked in before, they can check in now
        canCheckInNow = true;
        nextCheckInTime = now;
      } else {
        // Calculate the time difference from last check-in
        const hoursSinceLastCheckIn = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastCheckIn >= 24) {
          // Can check in if at least 24 hours have passed
          canCheckInNow = true;
          nextCheckInTime = now;
        } else {
          // Need to wait longer
          canCheckInNow = false;
          nextCheckInTime = new Date(lastCheckIn.getTime() + (24 * 60 * 60 * 1000));
        }
      }
      
      // Ensure we return proper ISO string dates for serialization
      return {
        currentStreak,
        lastCheckIn: lastCheckIn ? lastCheckIn.toISOString() : null,
        canCheckInNow,
        nextCheckInTime: nextCheckInTime ? nextCheckInTime.toISOString() : null
      };
    } catch (error) {
      console.error("Error getting user streak info:", error);
      throw error;
    }
  }
  
  async processUserCheckIn(userId: number): Promise<{
    success: boolean;
    points: number;
    newStreak: number;
    nextCheckInTime: string;
    message: string;
  }> {
    try {
      // Check if user exists and get streak info
      const streakInfo = await this.getUserCurrentStreak(userId);
      
      // If can't check in now, return early
      if (!streakInfo.canCheckInNow) {
        return {
          success: false,
          points: 0,
          newStreak: streakInfo.currentStreak,
          nextCheckInTime: streakInfo.nextCheckInTime || new Date().toISOString(), 
          message: "You can't check in yet. Please try again later."
        };
      }
      
      // Get user data
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      // Determine new streak value and points to award
      let newStreak = 1; // Start with 1 if streak is broken or no streak
      const now = new Date();
      
      if (streakInfo.lastCheckIn) {
        // Check if this is a continuation of a streak (less than 48 hours since last check-in)
        const lastCheckInDate = new Date(streakInfo.lastCheckIn);
        const hoursSinceLastCheckIn = (now.getTime() - lastCheckInDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastCheckIn < 48) {
          // Continuing streak
          newStreak = streakInfo.currentStreak + 1;
        }
      }
      
      // Determine points to award based on streak day
      const streakDay = newStreak % 7 || 7; // Convert 0 to 7 for the 7th day
      const points = streakDay === 7 ? 10 : 5; // 10 points on 7th day, 5 on other days
      
      // Create a record of this check-in - use transaction to ensure atomicity
      await db.transaction(async (tx) => {
        // Record the check-in
        await tx.insert(checkIns).values({
          userId,
          checkedInAt: now,
          streakDay,
          pointsEarned: points
        });
        
        // Add to points log
        const action = streakDay === 7 ? 'streak_complete' : 'daily_check_in';
        const description = streakDay === 7 
          ? `Completed 7-day streak` 
          : `Daily check-in (day ${streakDay})`;
        
        await tx.insert(pointsLog).values({
          userId,
          points,
          action,
          description
        });
        
        // Update user's streak and last check-in
        // Points are updated through the transaction via the points log entry
        await tx.update(users)
          .set({
            currentStreak: newStreak,
            lastCheckIn: now,
            points: (user.points || 0) + points
          })
          .where(eq(users.id, userId));
      });
      
      // Calculate next check-in time (24 hours from now)
      const nextCheckInTime = new Date(now.getTime() + (24 * 60 * 60 * 1000));
      
      return {
        success: true,
        points,
        newStreak,
        nextCheckInTime: nextCheckInTime.toISOString(),
        message: `You earned ${points} points! Your current streak is ${newStreak} day${newStreak !== 1 ? 's' : ''}.`
      };
    } catch (error) {
      console.error("Error processing user check-in:", error);
      throw error;
    }
  }
  
  async processUserSpin(userId: number): Promise<{
    success: boolean;
    points: number;
    nextSpinTime: string;
    message: string;
  }> {
    try {
      // Get user data
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      const now = new Date();
      
      // Check if user can spin (if they have lastSpin field and it's less than 24 hours ago, they can't spin)
      if (user.lastSpin) {
        const lastSpinDate = new Date(user.lastSpin);
        const hoursSinceLastSpin = (now.getTime() - lastSpinDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastSpin < 24) {
          // User needs to wait before spinning again
          const nextSpinTime = new Date(lastSpinDate.getTime() + (24 * 60 * 60 * 1000));
          return {
            success: false,
            points: 0,
            nextSpinTime: nextSpinTime.toISOString(),
            message: "You can't spin yet. Please try again later."
          };
        }
      }
      
      // User can spin! Determine random points award (1-5)
      const points = Math.floor(Math.random() * 5) + 1; // Random integer between 1 and 5
      
      // Use transaction to ensure atomicity
      await db.transaction(async (tx) => {
        // Add to points log
        await tx.insert(pointsLog).values({
          userId,
          points,
          action: 'spin_wheel',
          description: `Spin the wheel reward: ${points} points`
        });
        
        // Update user's last spin time and points
        await tx.update(users)
          .set({
            lastSpin: now,
            points: (user.points || 0) + points
          })
          .where(eq(users.id, userId));
      });
      
      // Calculate next spin time (24 hours from now)
      const nextSpinTime = new Date(now.getTime() + (24 * 60 * 60 * 1000));
      
      return {
        success: true,
        points,
        nextSpinTime: nextSpinTime.toISOString(),
        message: `Congratulations! You spun the wheel and earned ${points} points!`
      };
    } catch (error) {
      console.error("Error processing spin:", error);
      throw error;
    }
  }
  
  // Banner ad operations
  async getBannerAds(options?: { 
    location?: string, 
    isActive?: boolean 
  }): Promise<BannerAd[]> {
    try {
      let query = db.select().from(bannerAds);
      
      // Apply filters
      const filters = [];
      
      if (options?.location) {
        filters.push(eq(bannerAds.location, options.location));
      }
      
      if (options?.isActive !== undefined) {
        filters.push(eq(bannerAds.isActive, options.isActive));
      }
      
      if (filters.length > 0) {
        query = query.where(and(...filters));
      }
      
      return await query.orderBy(desc(bannerAds.createdAt));
    } catch (error) {
      console.error("Error getting banner ads:", error);
      return [];
    }
  }
  
  async getBannerAdById(id: number): Promise<BannerAd | undefined> {
    try {
      const [bannerAd] = await db.select().from(bannerAds).where(eq(bannerAds.id, id));
      return bannerAd;
    } catch (error) {
      console.error("Error getting banner ad by ID:", error);
      return undefined;
    }
  }
  
  async createBannerAd(insertBannerAd: InsertBannerAd): Promise<BannerAd> {
    try {
      const [bannerAd] = await db.insert(bannerAds).values({
        ...insertBannerAd,
        isActive: insertBannerAd.isActive !== undefined ? insertBannerAd.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      return bannerAd;
    } catch (error) {
      console.error("Error creating banner ad:", error);
      throw error;
    }
  }
  
  async updateBannerAd(bannerAd: BannerAd): Promise<BannerAd> {
    try {
      const [updatedBannerAd] = await db
        .update(bannerAds)
        .set({
          ...bannerAd,
          updatedAt: new Date()
        })
        .where(eq(bannerAds.id, bannerAd.id))
        .returning();
      
      return updatedBannerAd;
    } catch (error) {
      console.error("Error updating banner ad:", error);
      throw error;
    }
  }
  
  async toggleBannerAdStatus(id: number): Promise<BannerAd> {
    try {
      // Get the current banner ad
      const bannerAd = await this.getBannerAdById(id);
      if (!bannerAd) {
        throw new Error(`Banner ad with ID ${id} not found`);
      }
      
      // Toggle the isActive status
      const [updatedBannerAd] = await db
        .update(bannerAds)
        .set({
          isActive: !bannerAd.isActive,
          updatedAt: new Date()
        })
        .where(eq(bannerAds.id, id))
        .returning();
      
      return updatedBannerAd;
    } catch (error) {
      console.error("Error toggling banner ad status:", error);
      throw error;
    }
  }
  
  async deleteBannerAd(id: number): Promise<void> {
    try {
      await db.delete(bannerAds).where(eq(bannerAds.id, id));
    } catch (error) {
      console.error("Error deleting banner ad:", error);
      throw error;
    }
  }

  // Site Settings methods
  async getAllSettings(): Promise<SiteSetting[]> {
    try {
      return await db.select().from(siteSettings).orderBy(desc(siteSettings.updatedAt));
    } catch (error) {
      console.error("Error getting all settings:", error);
      return [];
    }
  }

  async getSettingByKey(key: string): Promise<SiteSetting | undefined> {
    try {
      const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
      return setting;
    } catch (error) {
      console.error(`Error getting setting by key '${key}':`, error);
      return undefined;
    }
  }

  async createOrUpdateSetting(data: InsertSiteSetting): Promise<SiteSetting | undefined> {
    try {
      // Check if the setting already exists
      const existingSetting = await this.getSettingByKey(data.key);
      
      if (existingSetting) {
        // Update existing setting
        const [updated] = await db.update(siteSettings)
          .set({
            value: data.value,
            description: data.description,
            updatedAt: new Date(),
          })
          .where(eq(siteSettings.id, existingSetting.id))
          .returning();
        return updated;
      } else {
        // Create new setting
        const [created] = await db.insert(siteSettings)
          .values(data)
          .returning();
        return created;
      }
    } catch (error) {
      console.error("Error creating/updating setting:", error);
      return undefined;
    }
  }

  async deleteSetting(id: number): Promise<boolean> {
    try {
      const result = await db.delete(siteSettings).where(eq(siteSettings.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting setting:", error);
      return false;
    }
  }
  
  // Content Pages operations
  
  async getAllContentPages(): Promise<ContentPage[]> {
    try {
      return await db.select().from(contentPages).orderBy(asc(contentPages.title));
    } catch (error) {
      console.error("Error getting all content pages:", error);
      return [];
    }
  }
  
  async getPublishedContentPages(): Promise<ContentPage[]> {
    try {
      return await db.select()
        .from(contentPages)
        .where(eq(contentPages.isPublished, true))
        .orderBy(asc(contentPages.title));
    } catch (error) {
      console.error("Error getting published content pages:", error);
      return [];
    }
  }
  
  async getContentPageBySlug(slug: string): Promise<ContentPage | undefined> {
    try {
      const [page] = await db.select()
        .from(contentPages)
        .where(eq(contentPages.slug, slug));
      return page;
    } catch (error) {
      console.error(`Error getting content page by slug '${slug}':`, error);
      return undefined;
    }
  }
  
  async getContentPageById(id: number): Promise<ContentPage | undefined> {
    try {
      const [page] = await db.select()
        .from(contentPages)
        .where(eq(contentPages.id, id));
      return page;
    } catch (error) {
      console.error(`Error getting content page by ID ${id}:`, error);
      return undefined;
    }
  }
  
  async createContentPage(data: InsertContentPage): Promise<ContentPage | undefined> {
    try {
      const [created] = await db.insert(contentPages)
        .values(data)
        .returning();
      return created;
    } catch (error) {
      console.error("Error creating content page:", error);
      return undefined;
    }
  }
  
  async updateContentPage(id: number, data: Partial<InsertContentPage>): Promise<ContentPage | undefined> {
    try {
      const [updated] = await db.update(contentPages)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(contentPages.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error(`Error updating content page with ID ${id}:`, error);
      return undefined;
    }
  }
  
  async deleteContentPage(id: number): Promise<boolean> {
    try {
      const result = await db.delete(contentPages)
        .where(eq(contentPages.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting content page with ID ${id}:`, error);
      return false;
    }
  }

  // Newsletter Subscribers operations
  
  async getAllSubscribers(): Promise<Subscriber[]> {
    try {
      return await db
        .select()
        .from(subscribers)
        .orderBy(desc(subscribers.createdAt));
    } catch (error) {
      console.error("Error getting all subscribers:", error);
      return [];
    }
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    try {
      console.log("Looking up subscriber with email:", email);
      const result = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.email, email.toLowerCase()));
      
      console.log("Subscriber lookup result:", result);
      return result[0];
    } catch (error) {
      console.error(`Error getting subscriber with email ${email}:`, error);
      return undefined;
    }
  }

  async createSubscriber(data: InsertSubscriber): Promise<Subscriber | undefined> {
    try {
      console.log("Creating new subscriber with data:", data);
      const result = await db
        .insert(subscribers)
        .values({
          ...data,
          email: data.email.toLowerCase(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      console.log("Create subscriber result:", result);
      return result[0];
    } catch (error) {
      console.error("Error creating subscriber:", error);
      throw error;
    }
  }

  async updateSubscriber(id: number, data: Partial<InsertSubscriber>): Promise<Subscriber | undefined> {
    try {
      const [subscriber] = await db
        .update(subscribers)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(subscribers.id, id))
        .returning();
      return subscriber;
    } catch (error) {
      console.error(`Error updating subscriber with ID ${id}:`, error);
      return undefined;
    }
  }

  async deleteSubscriber(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(subscribers)
        .where(eq(subscribers.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting subscriber with ID ${id}:`, error);
      return false;
    }
  }

  // Social media links operations
  async getAllSocialMediaLinks(): Promise<SocialMediaLink[]> {
    try {
      const result = await db
        .select()
        .from(socialMediaLinks)
        .orderBy(socialMediaLinks.platform);
      
      return result;
    } catch (error) {
      console.error("Error getting all social media links:", error);
      return [];
    }
  }

  async getSocialMediaLinkById(id: number): Promise<SocialMediaLink | undefined> {
    try {
      const [link] = await db
        .select()
        .from(socialMediaLinks)
        .where(eq(socialMediaLinks.id, id));
      
      return link;
    } catch (error) {
      console.error(`Error getting social media link with ID ${id}:`, error);
      return undefined;
    }
  }

  async createSocialMediaLink(data: InsertSocialMediaLink): Promise<SocialMediaLink> {
    try {
      const now = new Date();
      const isActive = data.isActive !== undefined ? data.isActive : true;
      
      const result = await db.insert(socialMediaLinks).values({
        platform: data.platform,
        url: data.url,
        icon: data.icon,
        isActive: isActive,
        createdAt: now,
        updatedAt: now
      }).returning();
      
      if (result.length === 0) {
        throw new Error("Failed to create social media link - no result returned");
      }
      
      return result[0];
    } catch (error) {
      console.error("Error creating social media link:", error);
      throw error;
    }
  }

  async updateSocialMediaLink(id: number, data: Partial<InsertSocialMediaLink>): Promise<SocialMediaLink> {
    try {
      const updateData: any = { ...data, updatedAt: new Date() };
      
      // Convert isActive to the database column name format
      if (data.isActive !== undefined) {
        updateData.isActive = data.isActive;
        delete updateData.isActive;
      }
      
      const result = await db
        .update(socialMediaLinks)
        .set(updateData)
        .where(eq(socialMediaLinks.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error(`Social media link with ID ${id} not found`);
      }
      
      return result[0];
    } catch (error) {
      console.error(`Error updating social media link with ID ${id}:`, error);
      throw error;
    }
  }

  async toggleSocialMediaLinkStatus(id: number): Promise<SocialMediaLink> {
    try {
      // First get the current status
      const currentLink = await this.getSocialMediaLinkById(id);
      
      if (!currentLink) {
        throw new Error(`Social media link with ID ${id} not found`);
      }
      
      // Then update with toggled status
      const result = await db
        .update(socialMediaLinks)
        .set({
          isActive: !currentLink.isActive,
          updatedAt: new Date()
        })
        .where(eq(socialMediaLinks.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error(`Error toggling social media link status for ID ${id}:`, error);
      throw error;
    }
  }

  async deleteSocialMediaLink(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(socialMediaLinks)
        .where(eq(socialMediaLinks.id, id))
        .returning({ id: socialMediaLinks.id });
      
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting social media link with ID ${id}:`, error);
      return false;
    }
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();

// Initialize with some seed data
(async () => {
  // Create some categories
  // Check if categories already exist before creating them
  const existingCategories = await storage.getCategories();
  
  if (existingCategories.length === 0) {
    const categoriesData: InsertCategory[] = [
      { name: "Retail", slug: "retail", icon: "shopping-cart", color: "blue" },
      { name: "Fashion", slug: "fashion", icon: "tshirt", color: "green" },
      { name: "Electronics", slug: "electronics", icon: "laptop", color: "purple" },
      { name: "Food", slug: "food", icon: "utensils", color: "red" },
      { name: "Travel", slug: "travel", icon: "plane", color: "yellow" },
    ];

    for (const category of categoriesData) {
      try {
        await storage.createCategory(category);
        console.log(`Created category: ${category.name}`);
      } catch (error) {
        console.error(`Error creating category ${category.name}:`, error);
      }
    }
  } else {
    console.log("Categories already exist, skipping initialization");
  }

  // Check if stores already exist before creating them
  const existingStores = await storage.getStores();
  
  if (existingStores.length === 0) {
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
      try {
        await storage.createStore(store);
        console.log(`Created store: ${store.name}`);
      } catch (error) {
        console.error(`Error creating store ${store.name}:`, error);
      }
    }
  } else {
    console.log("Stores already exist, skipping initialization");
  }

  // Check if coupons already exist before creating them
  const existingCoupons = await storage.getCoupons();
  
  if (existingCoupons.length === 0) {
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
      try {
        await storage.createCoupon(coupon);
        console.log(`Created coupon: ${coupon.title}`);
      } catch (error) {
        console.error(`Error creating coupon ${coupon.title}:`, error);
      }
    }
  } else {
    console.log("Coupons already exist, skipping initialization");
  }
  
  // Add initial social media links if they don't exist
  const existingSocialLinks = await storage.getAllSocialMediaLinks();
  
  if (existingSocialLinks.length === 0) {
    const socialLinksData: InsertSocialMediaLink[] = [
      {
        platform: "Facebook",
        url: "https://facebook.com/nepque",
        icon: "facebook",
        isActive: true
      },
      {
        platform: "Twitter",
        url: "https://twitter.com/nepque",
        icon: "twitter",
        isActive: true
      },
      {
        platform: "Instagram",
        url: "https://instagram.com/nepque",
        icon: "instagram",
        isActive: true
      },
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/company/nepque",
        icon: "linkedin",
        isActive: true
      }
    ];
    
    for (const link of socialLinksData) {
      try {
        await storage.createSocialMediaLink(link);
        console.log(`Created social media link: ${link.platform}`);
      } catch (error) {
        console.error(`Error creating social media link ${link.platform}:`, error);
      }
    }
  } else {
    console.log("Social media links already exist, skipping initialization");
  }
})();
