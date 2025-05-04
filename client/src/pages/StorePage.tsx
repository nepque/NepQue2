import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CouponWithRelations, Store, Category } from "@shared/schema";
import CouponCard from "@/components/coupon/CouponCard";
import CouponDetailModal from "@/components/coupon/CouponDetailModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import SEO from "@/components/common/SEO";

// Icons
import { 
  ArrowLeft, 
  Search,
  Filter,
  Star,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

const StoreLogoPlaceholder = ({ name }: { name: string }) => (
  <div className="w-20 h-20 flex items-center justify-center rounded-xl bg-blue-50 text-primary text-2xl font-bold">
    {name.charAt(0).toUpperCase()}
  </div>
);

const StorePage = () => {
  const [match, params] = useRoute("/store/:slug");
  const [, navigate] = useLocation();
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [selectedCoupon, setSelectedCoupon] = useState<CouponWithRelations | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Redirect if no match
  useEffect(() => {
    if (!match) {
      navigate("/", { replace: true });
    }
  }, [match, navigate]);

  // Fetch store data by slug
  const { data: store, isLoading: isLoadingStore } = useQuery<Store>({
    queryKey: ['/api/stores/bySlug', params?.slug],
    queryFn: async () => {
      if (!params?.slug) throw new Error("Store slug is required");
      const response = await fetch(`/api/stores/bySlug/${params.slug}`);
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

  // Fetch coupons for this store with sorting
  const { data: coupons, isLoading: isLoadingCoupons } = useQuery<CouponWithRelations[]>({
    queryKey: ["/api/coupons", { storeId: store?.id, sortBy: selectedSort }],
    queryFn: async () => {
      if (!store?.id) throw new Error("Store ID is required");
      const params = new URLSearchParams();
      params.append("storeId", store.id.toString());
      if (selectedSort) params.append("sortBy", selectedSort);
      
      const response = await fetch(`/api/coupons?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch coupons");
      }
      return response.json();
    },
    enabled: !!store?.id
  });

  // Fetch categories for filtering
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const handleShowCode = (coupon: CouponWithRelations) => {
    setSelectedCoupon(coupon);
  };

  const handleCloseModal = () => {
    setSelectedCoupon(null);
  };

  // Filter coupons by category
  const filteredCoupons = coupons?.filter(coupon => {
    if (activeTab === "all") return true;
    return coupon.category.slug === activeTab;
  });

  // Count coupons by category for the filter tabs
  const couponCountByCategory: Record<string, number> = { all: 0 };
  if (coupons) {
    couponCountByCategory.all = coupons.length;
    coupons.forEach(coupon => {
      const categorySlug = coupon.category.slug;
      couponCountByCategory[categorySlug] = (couponCountByCategory[categorySlug] || 0) + 1;
    });
  }

  return (
    <main className="bg-gray-50">
      {store && (
        <SEO
          title={store.metaTitle || `${store.name} Coupons & Promo Codes - Save With NepQue`}
          description={store.metaDescription || `Find the best ${store.name} coupons, promo codes, and deals to save on your next purchase. Updated ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`}
          keywords={store.metaKeywords || `${store.name}, promo codes, coupons, discount codes, deals, vouchers, offers`}
          canonicalUrl={`/store/${store.slug}`}
          ogType="website"
        />
      )}
      {/* Store Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">


          {isLoadingStore ? (
            <div className="flex items-start gap-6">
              <Skeleton className="w-20 h-20 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-72 mb-2" />
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
            </div>
          ) : store ? (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {store.logo ? (
                <div className="w-20 h-20 flex items-center justify-center bg-white rounded-xl shadow-sm p-2">
                  <img 
                    src={store.logo} 
                    alt={store.name} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.style.display = 'none';
                      const parent = target.parentNode as HTMLElement;
                      parent.innerHTML = store.name.charAt(0).toUpperCase();
                      parent.style.display = 'flex';
                      parent.style.alignItems = 'center';
                      parent.style.justifyContent = 'center';
                      parent.style.backgroundColor = '#EFF6FF';
                      parent.style.color = '#2563EB';
                      parent.style.fontSize = '2rem';
                      parent.style.fontWeight = 'bold';
                    }}
                  />
                </div>
              ) : (
                <StoreLogoPlaceholder name={store.name} />
              )}
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <h1 className="text-2xl font-bold text-gray-800 mr-2">{store.name}</h1>
                  <div className="w-5 h-5 flex items-center justify-center bg-green-100 rounded-full">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-sm text-green-600 ml-1">Verified Store</span>
                </div>
                <div className="flex flex-wrap items-center text-sm text-gray-500 mb-2 gap-x-4 gap-y-1">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" />
                    <span>4.8/5</span>
                  </div>
                  <span>{coupons?.length || 0} Active Coupons</span>
                  <span>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <p className="text-gray-600">
                    Find the best {store.name} coupons, promo codes, and deals to save on your next purchase.
                  </p>
                  {store.website && (
                    <a 
                      href={store.website.startsWith('http') ? store.website : `https://${store.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit Store
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Store not found</h2>
              <p className="text-gray-600 mb-4">The store you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => navigate('/stores')}>
                Browse All Stores
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Filters */}
      {store && (
        <section className="bg-white shadow-sm sticky top-16 z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="overflow-x-auto pb-1 -mx-1">
                <div className="flex space-x-2 px-1 min-w-max">
                  <Button
                    variant={activeTab === "all" ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setActiveTab("all")}
                  >
                    All Coupons ({couponCountByCategory["all"] || 0})
                  </Button>
                  {categories?.map(category => (
                    <Button
                      key={category.slug}
                      variant={activeTab === category.slug ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setActiveTab(category.slug)}
                    >
                      {category.name} ({couponCountByCategory[category.slug] || 0})
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Select value={selectedSort} onValueChange={setSelectedSort}>
                  <SelectTrigger className="w-[140px] h-9 rounded-lg bg-gray-100 border-none text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="expiring">Expiring Soon</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-9 rounded-lg bg-gray-100 border-none gap-1">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Coupons Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {isLoadingStore || isLoadingCoupons ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, index) => (
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
          ) : (
            filteredCoupons && filteredCoupons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCoupons.map((coupon) => (
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
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">No Coupons Found</h3>
                <p className="text-neutral-600 mb-4">
                  We couldn't find any coupons for this store {activeTab !== "all" ? `in the ${activeTab} category` : ""}.
                </p>
                {activeTab !== "all" && (
                  <Button variant="outline" onClick={() => setActiveTab("all")}>
                    View All Coupons
                  </Button>
                )}
              </div>
            )
          )}
        </div>
      </section>

      {selectedCoupon && (
        <CouponDetailModal
          coupon={selectedCoupon}
          onClose={handleCloseModal}
        />
      )}
    </main>
  );
};

export default StorePage;