import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CouponWithRelations, Store, Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  SlidersHorizontal,
  ChevronDown, 
  X,
  Calendar,
  Check
} from "lucide-react";
import CouponCard from "@/components/coupon/CouponCard";
import CouponDetailModal from "@/components/coupon/CouponDetailModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const SearchResultsPage = () => {
  const [match, params] = useRoute("/search");
  const [location, navigate] = useLocation();
  const [selectedCoupon, setSelectedCoupon] = useState<CouponWithRelations | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedStores, setSelectedStores] = useState<number[]>([]);
  const [onlyVerified, setOnlyVerified] = useState(false);

  // Get search query from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split("?")[1]);
    
    // Check for both "q" and "search" parameters to support both URL formats
    const query = searchParams.get("q") || searchParams.get("search");
    console.log("URL search params:", location, "Extracted query:", query);
    
    if (query) {
      setSearchQuery(query);
    }
  }, [location]);

  // Fetch coupons based on search query
  const { data: coupons, isLoading: isLoadingCoupons } = useQuery<CouponWithRelations[]>({
    queryKey: ["/api/coupons", { search: searchQuery, sortBy }],
    queryFn: async () => {
      if (!searchQuery) return [];
      
      // Use "search" parameter consistently for API calls
      let url = `/api/coupons?search=${encodeURIComponent(searchQuery)}`;
      if (sortBy) {
        url += `&sortBy=${sortBy}`;
      }
      
      console.log("Fetching search results from URL:", url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch coupons");
      }
      return response.json();
    },
    enabled: !!searchQuery
  });

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

  const handleShowCode = (coupon: CouponWithRelations) => {
    setSelectedCoupon(coupon);
  };

  const handleCloseModal = () => {
    setSelectedCoupon(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleStoreChange = (storeId: number) => {
    setSelectedStores(prev => 
      prev.includes(storeId)
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  // Apply filters
  const filteredCoupons = coupons?.filter(coupon => {
    // Filter by categories
    if (selectedCategories.length > 0 && !selectedCategories.includes(coupon.categoryId)) {
      return false;
    }
    
    // Filter by stores
    if (selectedStores.length > 0 && !selectedStores.includes(coupon.storeId)) {
      return false;
    }
    
    // Filter by verified
    if (onlyVerified && !coupon.verified) {
      return false;
    }
    
    return true;
  });

  // Grouped for displaying on mobile
  const hasActiveFilters = selectedCategories.length > 0 || selectedStores.length > 0 || onlyVerified;

  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Search Results</h1>
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for coupons, stores, or categories"
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white px-4 py-1.5 rounded-md hover:bg-primary/90"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile filters toggle */}
          <div className="lg:hidden mb-4">
            <Button 
              variant="outline" 
              className="w-full flex justify-between items-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <div className="flex items-center">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <span>Filters</span>
              </div>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {selectedCategories.length + selectedStores.length + (onlyVerified ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </div>
          
          {/* Filters - desktop sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="font-bold text-lg mb-4">Filters</h2>
              
              <div className="mb-6">
                <h3 className="font-medium text-sm text-gray-500 uppercase mb-3">Sort By</h3>
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="expiring">Expiring Soon</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-sm text-gray-500 uppercase mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories?.map(category => (
                    <div key={category.id} className="flex items-start">
                      <Checkbox 
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryChange(category.id)}
                      />
                      <Label
                        htmlFor={`category-${category.id}`}
                        className="ml-2 cursor-pointer"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-sm text-gray-500 uppercase mb-3">Stores</h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {stores?.map(store => (
                    <div key={store.id} className="flex items-start">
                      <Checkbox 
                        id={`store-${store.id}`}
                        checked={selectedStores.includes(store.id)}
                        onCheckedChange={() => handleStoreChange(store.id)}
                      />
                      <Label
                        htmlFor={`store-${store.id}`}
                        className="ml-2 cursor-pointer"
                      >
                        {store.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium text-sm text-gray-500 uppercase mb-3">Other</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="verified-only">Verified Only</Label>
                  <Switch
                    id="verified-only"
                    checked={onlyVerified}
                    onCheckedChange={setOnlyVerified}
                  />
                </div>
              </div>
              
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedStores([]);
                    setOnlyVerified(false);
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>
          
          {/* Mobile filters - collapsible */}
          {showFilters && (
            <div className="lg:hidden mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="sort">
                    <AccordionTrigger>Sort By</AccordionTrigger>
                    <AccordionContent>
                      <Select
                        value={sortBy}
                        onValueChange={(value) => setSortBy(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest</SelectItem>
                          <SelectItem value="expiring">Expiring Soon</SelectItem>
                          <SelectItem value="popular">Most Popular</SelectItem>
                        </SelectContent>
                      </Select>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="categories">
                    <AccordionTrigger>
                      Categories
                      {selectedCategories.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {selectedCategories.length}
                        </Badge>
                      )}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {categories?.map(category => (
                          <div key={category.id} className="flex items-start">
                            <Checkbox 
                              id={`m-category-${category.id}`}
                              checked={selectedCategories.includes(category.id)}
                              onCheckedChange={() => handleCategoryChange(category.id)}
                            />
                            <Label
                              htmlFor={`m-category-${category.id}`}
                              className="ml-2 cursor-pointer"
                            >
                              {category.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="stores">
                    <AccordionTrigger>
                      Stores
                      {selectedStores.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {selectedStores.length}
                        </Badge>
                      )}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {stores?.map(store => (
                          <div key={store.id} className="flex items-start">
                            <Checkbox 
                              id={`m-store-${store.id}`}
                              checked={selectedStores.includes(store.id)}
                              onCheckedChange={() => handleStoreChange(store.id)}
                            />
                            <Label
                              htmlFor={`m-store-${store.id}`}
                              className="ml-2 cursor-pointer"
                            >
                              {store.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="other">
                    <AccordionTrigger>Other</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="m-verified-only">Verified Only</Label>
                        <Switch
                          id="m-verified-only"
                          checked={onlyVerified}
                          onCheckedChange={setOnlyVerified}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedStores([]);
                      setOnlyVerified(false);
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* Results */}
          <div className="flex-1">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {searchQuery ? `Results for "${searchQuery}"` : "Search Results"}
              </h2>
              <p className="text-gray-500">
                {filteredCoupons?.length || 0} {filteredCoupons?.length === 1 ? "result" : "results"}
              </p>
            </div>
            
            {isLoadingCoupons ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredCoupons?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCoupons.map(coupon => (
                  <CouponCard 
                    key={coupon.id} 
                    coupon={coupon} 
                    onShowCode={() => handleShowCode(coupon)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Search className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any coupons matching your search criteria.
                </p>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Try:</p>
                  <ul className="list-disc list-inside">
                    <li>Checking your spelling</li>
                    <li>Using fewer or different keywords</li>
                    <li>Removing filters</li>
                    <li>Searching for a specific store name</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {selectedCoupon && (
        <CouponDetailModal 
          coupon={selectedCoupon} 
          onClose={handleCloseModal} 
        />
      )}
    </>
  );
};

export default SearchResultsPage;