import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import CouponCard from "@/components/coupon/CouponCard";
import CouponDetailModal from "@/components/coupon/CouponDetailModal";
import { CouponWithRelations } from "@shared/schema";
import { Category } from "@shared/schema";
import { Store } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import SEO from "@/components/common/SEO";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";

const CouponsPage = () => {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch() || "");
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCoupon, setSelectedCoupon] = useState<CouponWithRelations | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(searchParams.get("categoryId") || "all");
  const [selectedStoreId, setSelectedStoreId] = useState<string>(searchParams.get("storeId") || "all");
  const [selectedSort, setSelectedSort] = useState<string>(searchParams.get("sortBy") || "newest");
  const [featured, setFeatured] = useState<boolean>(searchParams.get("featured") === "true");

  // Build query parameters
  const queryParams: any = {};
  if (selectedCategoryId && selectedCategoryId !== "all") queryParams.categoryId = Number(selectedCategoryId);
  if (selectedStoreId && selectedStoreId !== "all") queryParams.storeId = Number(selectedStoreId);
  if (searchTerm) queryParams.search = searchTerm;
  if (featured) queryParams.featured = true;
  if (selectedSort) queryParams.sortBy = selectedSort;

  // Fetch coupons
  const { data: coupons, isLoading: isLoadingCoupons } = useQuery<CouponWithRelations[]>({
    queryKey: ["/api/coupons", queryParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategoryId && selectedCategoryId !== "all") params.append("categoryId", selectedCategoryId);
      if (selectedStoreId && selectedStoreId !== "all") params.append("storeId", selectedStoreId);
      if (searchTerm) params.append("search", searchTerm);
      if (featured) params.append("featured", "true");
      if (selectedSort) params.append("sortBy", selectedSort);

      const response = await fetch(`/api/coupons?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch coupons");
      return response.json();
    }
  });

  // Fetch categories for filter
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    }
  });

  // Fetch stores for filter
  const { data: stores } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
    queryFn: async () => {
      const response = await fetch("/api/stores");
      if (!response.ok) throw new Error("Failed to fetch stores");
      return response.json();
    }
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategoryId && selectedCategoryId !== "all") params.append("categoryId", selectedCategoryId);
    if (selectedStoreId && selectedStoreId !== "all") params.append("storeId", selectedStoreId);
    if (searchTerm) params.append("search", searchTerm);
    if (featured) params.append("featured", "true");
    if (selectedSort) params.append("sortBy", selectedSort);

    const newSearch = params.toString() ? `?${params.toString()}` : "";
    setLocation(`/coupons${newSearch}`, { replace: true });
  }, [selectedCategoryId, selectedStoreId, searchTerm, featured, selectedSort, setLocation]);

  // Handle search input submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already being handled by the effect
  };

  // Handle show coupon code
  const handleShowCode = (coupon: CouponWithRelations) => {
    setSelectedCoupon(coupon);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setSelectedCoupon(null);
  };

  // Handle clear filters
  const clearFilters = () => {
    setSelectedCategoryId("all");
    setSelectedStoreId("all");
    setSelectedSort("newest");
    setFeatured(false);
    if (searchTerm) setSearchTerm("");
  };

  // Count active filters
  const activeFilterCount = [
    selectedCategoryId !== "all" ? selectedCategoryId : null,
    selectedStoreId !== "all" ? selectedStoreId : null,
    featured,
    searchTerm
  ].filter(Boolean).length;

  // Create dynamic SEO meta information based on filters
  const pageTitle = useMemo(() => {
    if (featured) return "Featured Coupons & Promo Codes";
    if (selectedCategoryId && selectedCategoryId !== "all" && categories) {
      const category = categories.find(c => c.id === Number(selectedCategoryId));
      return category ? `${category.name} Coupons & Promo Codes` : "All Coupons";
    }
    if (selectedStoreId && selectedStoreId !== "all" && stores) {
      const store = stores.find(s => s.id === Number(selectedStoreId));
      return store ? `${store.name} Coupons & Promo Codes` : "All Coupons";
    }
    if (searchTerm) return `Coupons for "${searchTerm}" - Search Results`;
    return "All Coupons & Promo Codes";
  }, [featured, selectedCategoryId, selectedStoreId, searchTerm, categories, stores]);

  const pageDescription = useMemo(() => {
    if (featured) return "Browse our handpicked collection of featured coupons and deals from top brands. Save money with these verified promotional offers.";
    if (selectedCategoryId && selectedCategoryId !== "all" && categories) {
      const category = categories.find(c => c.id === Number(selectedCategoryId));
      return category 
        ? `Find the best ${category.name} coupons and promo codes. Save money with verified discount codes for ${category.name} products and services.`
        : "Browse our extensive collection of coupons and promo codes to save on your next purchase.";
    }
    if (selectedStoreId && selectedStoreId !== "all" && stores) {
      const store = stores.find(s => s.id === Number(selectedStoreId));
      return store 
        ? `Find the latest ${store.name} coupons, promo codes and deals. Save money on your next purchase with these verified ${store.name} discount codes.`
        : "Browse our extensive collection of coupons and promo codes to save on your next purchase.";
    }
    if (searchTerm) return `Browse coupons and promo codes matching "${searchTerm}". Find the best deals and discounts for your search.`;
    return "Browse our extensive collection of coupons and promo codes from top stores and brands. Save money on your next purchase with verified discount codes.";
  }, [featured, selectedCategoryId, selectedStoreId, searchTerm, categories, stores]);

  const canonicalUrl = useMemo(() => {
    let url = "/coupons";
    const params = new URLSearchParams();
    
    if (selectedCategoryId && selectedCategoryId !== "all") params.append("categoryId", selectedCategoryId);
    if (selectedStoreId && selectedStoreId !== "all") params.append("storeId", selectedStoreId);
    if (featured) params.append("featured", "true");
    
    // Exclude search term from canonical URL to avoid duplicate content issues
    // Exclude sort from canonical URL as it doesn't change the content, just the order
    
    return params.toString() ? `${url}?${params.toString()}` : url;
  }, [selectedCategoryId, selectedStoreId, featured]);

  return (
    <main className="py-6 bg-gray-50">
      <SEO 
        title={`${pageTitle} | NepQue`}
        description={pageDescription}
        keywords={`coupons, promo codes, discounts, deals, savings, online shopping${
          selectedCategoryId && selectedCategoryId !== "all" && categories 
            ? `, ${categories.find(c => c.id === Number(selectedCategoryId))?.name}` 
            : ""
        }${
          selectedStoreId && selectedStoreId !== "all" && stores
            ? `, ${stores.find(s => s.id === Number(selectedStoreId))?.name}`
            : ""
        }${
          searchTerm ? `, ${searchTerm}` : ""
        }`}
        canonicalUrl={canonicalUrl}
        ogType="website"
      />
      <div className="container mx-auto px-4">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-800">
            {featured ? "Featured Coupons" : 
              selectedCategoryId && selectedCategoryId !== "all" && categories ? `${categories.find(c => c.id === Number(selectedCategoryId))?.name} Coupons` :
              selectedStoreId && selectedStoreId !== "all" && stores ? `${stores.find(s => s.id === Number(selectedStoreId))?.name} Coupons` :
              searchTerm ? `Search Results for "${searchTerm}"` : "All Coupons"}
          </h1>
          <p className="text-neutral-600 mt-1">
            Find the best deals and save with our verified coupon codes
          </p>
        </div>

        {/* Search and filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-grow relative">
                <Input
                  type="text"
                  placeholder="Search for coupons, stores or brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              <Button type="submit" className="bg-secondary hover:bg-secondary/90">
                Search
              </Button>
            </div>
          </form>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {stores?.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className={`${featured ? 'bg-primary/10 border-primary text-primary' : ''}`}
                onClick={() => setFeatured(!featured)}
              >
                <Filter className="h-4 w-4 mr-1" /> Featured
              </Button>

              {activeFilterCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4 mr-1" /> Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Coupons grid */}
        {isLoadingCoupons ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(9).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
                  <div className="flex items-center">
                    <Skeleton className="w-12 h-12 rounded-md" />
                    <div className="ml-3">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-16 mt-1" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-10 w-2/3" />
                  <Skeleton className="h-10 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : coupons && coupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onShowCode={() => handleShowCode(coupon)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 text-neutral-500 rounded-full mb-4">
              <i className="fas fa-search text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">No Coupons Found</h3>
            <p className="text-neutral-600 mb-4">We couldn't find any coupons matching your criteria.</p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {selectedCoupon && (
        <CouponDetailModal
          coupon={selectedCoupon}
          onClose={handleCloseModal}
        />
      )}
    </main>
  );
};

export default CouponsPage;
