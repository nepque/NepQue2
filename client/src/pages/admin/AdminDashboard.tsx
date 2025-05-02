import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingBag, 
  Tag, 
  Store as StoreIcon, 
  BarChart2, 
  TrendingUp, 
  Users 
} from "lucide-react";
import { CouponWithRelations, Category, Store } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  isLoading 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  trend?: { value: string; up: boolean };
  isLoading?: boolean;
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {trend && (
          <div className={`text-xs flex items-center mt-1 ${trend.up ? 'text-green-600' : 'text-red-600'}`}>
            {trend.up ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1 rotate-180" />}
            {trend.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
  // Fetch coupons
  const { data: coupons, isLoading: isLoadingCoupons } = useQuery<CouponWithRelations[]>({
    queryKey: ["/api/coupons"],
    queryFn: async () => {
      const response = await fetch("/api/coupons");
      if (!response.ok) {
        throw new Error("Failed to fetch coupons");
      }
      return response.json();
    }
  });

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response.json();
    }
  });

  // Fetch stores
  const { data: stores, isLoading: isLoadingStores } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
    queryFn: async () => {
      const response = await fetch("/api/stores");
      if (!response.ok) {
        throw new Error("Failed to fetch stores");
      }
      return response.json();
    }
  });

  // Calculate total coupon usage
  const totalUsage = coupons?.reduce((sum, coupon) => sum + (coupon.usedCount || 0), 0) || 0;

  // Get active coupons (not expired)
  const activeCoupons = coupons?.filter(coupon => new Date(coupon.expiresAt) > new Date()) || [];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard 
          title="Total Coupons" 
          value={coupons?.length || 0}
          icon={<Tag className="h-5 w-5 text-primary" />}
          isLoading={isLoadingCoupons}
        />
        <DashboardCard 
          title="Total Stores" 
          value={stores?.length || 0}
          icon={<StoreIcon className="h-5 w-5 text-primary" />}
          isLoading={isLoadingStores}
        />
        <DashboardCard 
          title="Total Categories" 
          value={categories?.length || 0}
          icon={<ShoppingBag className="h-5 w-5 text-primary" />}
          isLoading={isLoadingCategories}
        />
        <DashboardCard 
          title="Total Coupon Usage" 
          value={totalUsage}
          icon={<BarChart2 className="h-5 w-5 text-primary" />}
          isLoading={isLoadingCoupons}
          trend={{ value: "12% from last month", up: true }}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Coupons */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Coupons</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCoupons ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : coupons && coupons.length > 0 ? (
              <div className="space-y-2">
                {coupons.slice(0, 5).map(coupon => (
                  <div key={coupon.id} className="p-3 border rounded-md flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{coupon.title}</p>
                      <p className="text-xs text-gray-500">{coupon.store.name}</p>
                    </div>
                    <div className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {coupon.usedCount || 0} uses
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No coupons available</p>
            )}
          </CardContent>
        </Card>
        
        {/* Popular Stores */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Popular Stores</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStores || isLoadingCoupons ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : stores && stores.length > 0 && coupons ? (
              <div className="space-y-2">
                {stores
                  .map(store => ({
                    ...store,
                    totalUses: coupons
                      .filter(c => c.storeId === store.id)
                      .reduce((sum, c) => sum + (c.usedCount || 0), 0)
                  }))
                  .sort((a, b) => b.totalUses - a.totalUses)
                  .slice(0, 5)
                  .map(store => (
                    <div key={store.id} className="p-3 border rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 mr-3 flex items-center justify-center">
                          <img 
                            src={store.logo} 
                            alt={store.name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=random&size=32`;
                            }}
                          />
                        </div>
                        <p className="font-medium text-sm">{store.name}</p>
                      </div>
                      <div className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {store.totalUses} uses
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No stores available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;