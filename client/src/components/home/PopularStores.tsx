import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface StoreWithCount {
  id: number;
  name: string;
  slug: string;
  logo: string;
  website: string;
  couponCount: number;
}

const PopularStores = () => {
  const { data: stores, isLoading } = useQuery<StoreWithCount[]>({
    queryKey: ["/api/stores/with-counts"],
    queryFn: async () => {
      const response = await fetch("/api/stores/with-counts");
      if (!response.ok) throw new Error("Failed to fetch stores");
      return response.json();
    }
  });

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-neutral-800 mb-8 text-center">Popular Stores</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {isLoading ? (
            // Loading skeletons
            Array(12).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg p-4 text-center border border-neutral-200 flex flex-col items-center">
                <Skeleton className="w-16 h-16 rounded-full mb-3" />
                <Skeleton className="h-5 w-20 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          ) : (
            stores?.slice(0, 12).map((store) => (
              <Link
                key={store.id}
                href={`/store/${store.slug}`}
                className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow border border-neutral-200 flex flex-col items-center"
              >
                <img 
                  src={store.logo} 
                  alt={store.name} 
                  className="w-16 h-16 object-contain mb-3 rounded-md"
                  onError={(e) => {
                    // Fallback if logo doesn't load
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=random&size=64`;
                  }}
                />
                <h3 className="font-medium text-neutral-800">{store.name}</h3>
                <p className="text-sm text-neutral-500 mt-1">{store.couponCount} coupons</p>
              </Link>
            ))
          )}
        </div>
        
        <div className="text-center mt-8">
          <Link href="/coupons" className="inline-flex items-center text-primary hover:text-primary/80 font-medium">
            View All Stores <i className="fas fa-chevron-right ml-2 text-sm"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularStores;
