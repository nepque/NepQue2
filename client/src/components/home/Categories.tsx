import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryWithCount {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  couponCount: number;
}

const Categories = () => {
  const { data: categories, isLoading } = useQuery<CategoryWithCount[]>({
    queryKey: ["/api/categories/with-counts"],
    queryFn: async () => {
      const response = await fetch("/api/categories/with-counts");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    }
  });

  // Function to get color class based on category color
  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-primary";
      case "green":
        return "bg-green-100 text-green-600";
      case "purple":
        return "bg-purple-100 text-purple-600";
      case "red":
        return "bg-red-100 text-red-600";
      case "yellow":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-neutral-200 text-neutral-600";
    }
  };

  return (
    <section className="py-12 bg-neutral-100">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-neutral-800 mb-8 text-center">Browse By Category</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {isLoading ? (
            // Loading skeletons
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg p-4 text-center border border-neutral-200">
                <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
                <Skeleton className="h-5 w-20 mx-auto mb-1" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))
          ) : (
            categories?.slice(0, 5).map((category) => (
              <Link
                key={category.id}
                href={`/coupons?categoryId=${category.id}`}
                className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow border border-neutral-200"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 ${getColorClasses(category.color)} rounded-full mb-3`}>
                  <i className={`fas fa-${category.icon} text-lg`}></i>
                </div>
                <h3 className="font-medium text-neutral-800">{category.name}</h3>
                <p className="text-sm text-neutral-500 mt-1">{category.couponCount} coupons</p>
              </Link>
            ))
          )}
          
          {!isLoading && (
            <Link href="/coupons" className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow border border-neutral-200">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-neutral-200 text-neutral-600 rounded-full mb-3">
                <i className="fas fa-ellipsis-h text-lg"></i>
              </div>
              <h3 className="font-medium text-neutral-800">More</h3>
              <p className="text-sm text-neutral-500 mt-1">View All</p>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default Categories;
