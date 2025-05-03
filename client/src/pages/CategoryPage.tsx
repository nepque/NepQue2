import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Category, CouponWithRelations, Store } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import CouponCard from "@/components/coupon/CouponCard";
import CouponDetailModal from "@/components/coupon/CouponDetailModal";
import { generatePlaceholderImage } from "@/lib/utils";
import SEO from "@/components/common/SEO";

const CategoryPage = () => {
  const [match, params] = useRoute("/category/:slug");
  const [, navigate] = useLocation();
  const [selectedCoupon, setSelectedCoupon] = useState<CouponWithRelations | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedStore, setSelectedStore] = useState<number | null>(null);

  // Redirect if no match
  useEffect(() => {
    if (!match) {
      navigate("/", { replace: true });
    }
  }, [match, navigate]);

  // Fetch category data by slug
  const { data: category, isLoading: isLoadingCategory } = useQuery<Category>({
    queryKey: ['/api/categories/bySlug', params?.slug],
    queryFn: async () => {
      if (!params?.slug) throw new Error("Category slug is required");
      const response = await fetch(`/api/categories/bySlug/${params.slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          navigate("/", { replace: true });
          throw new Error("Category not found");
        }
        throw new Error("Failed to fetch category");
      }
      return response.json();
    },
    enabled: !!params?.slug
  });

  // Fetch coupons for this category
  const { data: coupons, isLoading: isLoadingCoupons } = useQuery<CouponWithRelations[]>({
    queryKey: ["/api/coupons", { categoryId: category?.id, storeId: selectedStore }],
    queryFn: async () => {
      if (!category?.id) throw new Error("Category ID is required");
      let url = `/api/coupons?categoryId=${category.id}`;
      if (selectedStore) {
        url += `&storeId=${selectedStore}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch coupons");
      }
      return response.json();
    },
    enabled: !!category?.id
  });

  // Fetch stores to use for filtering
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

  const filteredCoupons = coupons?.filter(coupon => {
    if (activeTab === "all") return true;
    if (activeTab === "codes" && coupon.code) return true;
    if (activeTab === "deals" && !coupon.code) return true;
    return false;
  });

  // Group coupons by store for display
  const couponsByStore = filteredCoupons?.reduce<Record<number, CouponWithRelations[]>>((acc, coupon) => {
    if (!acc[coupon.storeId]) {
      acc[coupon.storeId] = [];
    }
    acc[coupon.storeId].push(coupon);
    return acc;
  }, {});

  if (isLoadingCategory) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-2">
            <Skeleton className="h-6 w-20 bg-white/30" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-10 w-10 mr-3 rounded-md bg-white/30" />
            <Skeleton className="h-8 w-48 bg-white/30" />
          </div>
          <Skeleton className="h-5 w-full max-w-md mt-2 bg-white/30" />
        </div>
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-12 w-full mb-6 bg-gray-200" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) return null;

  const iconColor = category.color || "#2563eb";

  return (
    <>
      <SEO
        title={category.metaTitle || `${category.name} Coupons & Promo Codes`}
        description={category.metaDescription || `Find the best ${category.name} discount codes, deals, and sales. Save on your next purchase with these verified offers.`}
        keywords={category.metaKeywords || `${category.name}, coupons, promo codes, deals, discounts, sales`}
        canonicalUrl={`/category/${category.slug}`}
        ogType="website"
      />
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-2">
            <Button 
              variant="ghost" 
              className="pl-0 text-white hover:text-white/90 hover:bg-white/10" 
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Categories
            </Button>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-md flex items-center justify-center mr-3" style={{ backgroundColor: iconColor }}>
              <span className="text-white text-xl">{category.icon}</span>
            </div>
            <h1 className="text-3xl font-bold">{category.name} Coupons & Deals</h1>
          </div>
          <p className="mt-2 text-white/80 max-w-2xl">
            Find the best {category.name} discount codes, deals, and sales. Save on your next purchase with these verified offers.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
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
        
        {/* Store filter */}
        {stores && stores.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Filter by Store</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedStore === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStore(null)}
              >
                All Stores
              </Button>
              {stores.map(store => (
                <Button
                  key={store.id}
                  variant={selectedStore === store.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStore(store.id === selectedStore ? null : store.id)}
                >
                  {store.name}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {isLoadingCoupons ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredCoupons && filteredCoupons.length > 0 ? (
          <div>
            {/* If filtering by store, show all coupons together */}
            {selectedStore ? (
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
              // If showing all stores, group by store
              <div className="space-y-8">
                {Object.entries(couponsByStore || {}).map(([storeIdStr, storeCoupons]) => {
                  const storeId = parseInt(storeIdStr);
                  const store = stores?.find(s => s.id === storeId);
                  if (!store || !storeCoupons.length) return null;
                  
                  return (
                    <div key={storeId} className="pb-6 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-white flex items-center justify-center border border-gray-200">
                          <img 
                            src={store.logo} 
                            alt={store.name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = generatePlaceholderImage(store.name);
                            }}
                          />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{store.name}</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {storeCoupons.map(coupon => (
                          <CouponCard 
                            key={coupon.id} 
                            coupon={coupon} 
                            onShowCode={() => handleShowCode(coupon)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-2">No {activeTab !== 'all' ? activeTab : ''} coupons available</h3>
            <p className="text-gray-600">
              We couldn't find any {activeTab !== 'all' ? activeTab : ''} coupons for this category{selectedStore ? ' and store' : ''} at the moment. Please check back later.
            </p>
          </div>
        )}
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

export default CategoryPage;