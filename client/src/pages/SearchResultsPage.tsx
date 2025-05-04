import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import CouponCard from "@/components/coupon/CouponCard";
import CouponDetailModal from "@/components/coupon/CouponDetailModal";
import { useQuery } from "@tanstack/react-query";
import { Category, Store, CouponWithRelations } from "@shared/schema";

const SearchResultsPage = () => {
  const [location, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState<CouponWithRelations | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [featured, setFeatured] = useState(false);

  // Get search query from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split("?")[1]);
    // Check for both "q" and "search" parameters to support both URL formats
    const query = searchParams.get("q") || searchParams.get("search");
    console.log("URL search params:", location, "Extracted query:", query);
    
    if (query) {
      setSearchTerm(query);
    }
  }, [location]);

  // Fetch categories for filtering
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response.json();
    }
  });

  // Fetch stores for filtering
  const { data: stores } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
    queryFn: async () => {
      const response = await fetch("/api/stores");
      if (!response.ok) {
        throw new Error("Failed to fetch stores");
      }
      return response.json();
    }
  });

  // Fetch coupons based on search term
  const { data: coupons = [], isLoading } = useQuery<CouponWithRelations[]>({
    queryKey: ["/api/coupons", { search: searchTerm, sortBy }],
    queryFn: async () => {
      if (!searchTerm) return [];
      
      // Use "search" parameter consistently for API calls
      let url = `/api/coupons?search=${encodeURIComponent(searchTerm)}`;
      if (sortBy) {
        url += `&sortBy=${sortBy}`;
      }
      if (selectedCategory !== "all") {
        url += `&categoryId=${selectedCategory}`;
      }
      if (selectedStore !== "all") {
        url += `&storeId=${selectedStore}`;
      }
      if (featured) {
        url += `&featured=true`;
      }
      
      console.log("Fetching search results from URL:", url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch coupons");
      }
      return response.json();
    },
    enabled: !!searchTerm
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedStore("all");
    setSortBy("newest");
    setFeatured(false);
  };

  const filteredCoupons = coupons?.filter(coupon => {
    // Apply additional client-side filters if needed
    if (selectedCategory !== "all" && coupon.categoryId.toString() !== selectedCategory) {
      return false;
    }
    if (selectedStore !== "all" && coupon.storeId.toString() !== selectedStore) {
      return false;
    }
    if (featured && !coupon.featured) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-2">Search Results for "{searchTerm}"</h1>
          <p className="text-gray-600 mb-6">Find the best deals and save with our verified coupon codes</p>

          <form onSubmit={handleSearch}>
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for coupons, stores, or categories"
                className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-md"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores?.map(store => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Newest First" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center space-x-2">
              <Button
                variant={featured ? "default" : "outline"}
                className="flex items-center gap-2"
                onClick={() => setFeatured(!featured)}
              >
                Featured
              </Button>

              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={clearFilters}
              >
                <X className="h-4 w-4" /> Clear Filters
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : filteredCoupons.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredCoupons.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  onShowCode={() => setSelectedCoupon(coupon)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex rounded-full bg-gray-100 p-4 mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Coupons Found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                We couldn't find any coupons matching your criteria.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedCoupon && (
        <CouponDetailModal
          coupon={selectedCoupon}
          onClose={() => setSelectedCoupon(null)}
        />
      )}
    </div>
  );
};

export default SearchResultsPage;