import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Store, CouponWithRelations } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import CouponCard from "@/components/coupon/CouponCard";
import CouponDetailModal from "@/components/coupon/CouponDetailModal";

const StorePage = () => {
  const [match, params] = useRoute("/store/:slug");
  const [, navigate] = useLocation();
  const [selectedCoupon, setSelectedCoupon] = useState<CouponWithRelations | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Redirect if no match
  useEffect(() => {
    if (!match) {
      navigate("/", { replace: true });
    }
  }, [match, navigate]);

  // Fetch store data
  const { data: store, isLoading: isLoadingStore } = useQuery<Store>({
    queryKey: [`/api/stores/${params?.slug}`],
    queryFn: async () => {
      if (!params?.slug) throw new Error("Store slug is required");
      const response = await fetch(`/api/stores/${params.slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          navigate("/", { replace: true });
          throw new Error("Store not found");
        }
        throw new Error("Failed to fetch store");
      }
      return response.json();
    },
    enabled: !!params?.slug
  });

  // Fetch coupons for this store
  const { data: coupons, isLoading: isLoadingCoupons } = useQuery<CouponWithRelations[]>({
    queryKey: ["/api/coupons", { storeId: store?.id }],
    queryFn: async () => {
      if (!store?.id) throw new Error("Store ID is required");
      const response = await fetch(`/api/coupons?storeId=${store.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch coupons");
      }
      return response.json();
    },
    enabled: !!store?.id
  });

  const handleShowCode = (coupon: CouponWithRelations) => {
    setSelectedCoupon(coupon);
  };

  const handleCloseModal = () => {
    setSelectedCoupon(null);
  };

  const filteredCoupons = coupons?.filter(coupon => {
    if (activeTab === "all") return true;
    if (activeTab === "codes" && coupon.code) return true;
    if (activeTab === "deals" && !coupon.code) return true;
    return false;
  });

  if (isLoadingStore) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-4">
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
            <Skeleton className="w-24 h-24 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-5 w-full max-w-md mb-3" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <Skeleton className="h-12 w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!store) return null;

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              className="pl-0" 
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stores
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
            <div className="w-24 h-24 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-2">
              <img 
                src={store.logo} 
                alt={store.name} 
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=random&size=64`;
                }}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{store.name} Coupons & Promo Codes</h1>
              <p className="text-gray-600 mb-3">
                Find the latest {store.name} discount codes, vouchers, and promotions to save on your next purchase.
              </p>
              <a 
                href={store.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
              >
                Visit {store.name} Website
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
            <div className="flex border-b">
              <button 
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'all' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setActiveTab('all')}
              >
                All ({coupons?.length || 0})
              </button>
              <button 
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'codes' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setActiveTab('codes')}
              >
                Codes
              </button>
              <button 
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'deals' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setActiveTab('deals')}
              >
                Deals
              </button>
            </div>
          </div>
          
          {isLoadingCoupons ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredCoupons && filteredCoupons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoupons.map(coupon => (
                <CouponCard 
                  key={coupon.id} 
                  coupon={coupon} 
                  onShowCode={() => handleShowCode(coupon)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <h3 className="text-lg font-medium text-gray-800 mb-2">No {activeTab !== 'all' ? activeTab : ''} coupons available</h3>
              <p className="text-gray-600">
                We couldn't find any {activeTab !== 'all' ? activeTab : ''} coupons for {store.name} at the moment. Please check back later.
              </p>
            </div>
          )}
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

export default StorePage;