import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CouponCard from "@/components/coupon/CouponCard";
import CouponDetailModal from "@/components/coupon/CouponDetailModal";
import { CouponWithRelations } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface SortOption {
  value: string;
  label: string;
}

const sortOptions: SortOption[] = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Popularity" },
  { value: "expiring", label: "Expiring Soon" }
];

const FeaturedCoupons = () => {
  const [selectedSort, setSelectedSort] = useState("newest");
  const [selectedCoupon, setSelectedCoupon] = useState<CouponWithRelations | null>(null);

  const { data: coupons, isLoading } = useQuery<CouponWithRelations[]>({
    queryKey: ["/api/coupons", { featured: true, sortBy: selectedSort }],
    queryFn: async () => {
      const response = await fetch(`/api/coupons?featured=true&sortBy=${selectedSort}`);
      if (!response.ok) throw new Error("Failed to fetch coupons");
      return response.json();
    }
  });

  const handleShowCode = (coupon: CouponWithRelations) => {
    setSelectedCoupon(coupon);
  };

  const handleCloseModal = () => {
    setSelectedCoupon(null);
  };

  const handleSortChange = (value: string) => {
    setSelectedSort(value);
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4 md:mb-0">Featured Coupons</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="bg-white hover:bg-neutral-100 text-neutral-600 font-medium px-4 py-2 rounded border border-neutral-200 transition-colors">
              <i className="fas fa-filter mr-2"></i> Filter
            </Button>
            <Select value={selectedSort} onValueChange={handleSortChange}>
              <SelectTrigger className="bg-white text-neutral-600 font-medium px-4 py-2 rounded border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/50 h-auto w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array(6).fill(0).map((_, index) => (
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
            ))
          ) : (
            coupons?.slice(0, 6).map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onShowCode={() => handleShowCode(coupon)}
              />
            ))
          )}
        </div>

        <div className="text-center mt-8">
          <Link href="/coupons" className="inline-flex items-center text-primary hover:text-primary/80 font-medium">
            View All Coupons <i className="fas fa-chevron-right ml-2 text-sm"></i>
          </Link>
        </div>
      </div>
      
      {selectedCoupon && (
        <CouponDetailModal
          coupon={selectedCoupon}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
};

export default FeaturedCoupons;
