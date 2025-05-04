import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CouponWithRelations } from "@shared/schema";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import CouponCard from "@/components/coupon/CouponCard";
import CouponDetailModal from "@/components/coupon/CouponDetailModal";
import { useQuery } from "@tanstack/react-query";

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
    const params = new URLSearchParams(location.split("?")[1]);
    const query = params.get("search");
    if (query) {
      setSearchTerm(query);
    }
  }, [location]);

  // Fetch coupons
  const { data: coupons = [], isLoading } = useQuery<CouponWithRelations[]>({
    queryKey: ["/api/coupons", { search: searchTerm, sortBy, category: selectedCategory, store: selectedStore, featured }],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: searchTerm,
        sortBy,
        ...(selectedCategory !== "all" && { categoryId: selectedCategory }),
        ...(selectedStore !== "all" && { storeId: selectedStore }),
        ...(featured && { featured: "true" })
      });

      const response = await fetch(`/api/coupons/search?${params}`);
      if (!response.ok) throw new Error("Failed to fetch coupons");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-2">Search Results for "{searchTerm}"</h1>
          <p className="text-gray-600 mb-6">Find the best deals and save with our verified coupon codes</p>

          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for stores, brands or coupons..."
                className="flex-grow"
              />
              <Button type="submit">Search</Button>
            </div>
          </form>

          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {/* Add categories dynamically */}
              </SelectContent>
            </Select>

            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {/* Add stores dynamically */}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="popularity">Most Popular</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setFeatured(!featured)}
            >
              {featured ? "★ Featured" : "Featured"}
            </Button>

            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={clearFilters}
            >
              <X className="h-4 w-4" /> Clear Filters
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : coupons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  onShowCode={() => setSelectedCoupon(coupon)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Coupons Found</h3>
              <p className="text-gray-600">
                We couldn't find any coupons matching your criteria.
              </p>
              <Button variant="link" onClick={clearFilters}>
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