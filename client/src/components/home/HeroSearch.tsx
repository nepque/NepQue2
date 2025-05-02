import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PopularSearch {
  name: string;
  search: string;
}

const popularSearches: PopularSearch[] = [
  { name: "Amazon", search: "amazon" },
  { name: "Walmart", search: "walmart" },
  { name: "Target", search: "target" },
  { name: "Best Buy", search: "best buy" }
];

const HeroSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/coupons?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handlePopularSearch = (search: string) => {
    navigate(`/coupons?search=${encodeURIComponent(search)}`);
  };

  return (
    <section className="bg-primary py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">Find the Best Coupons & Deals</h1>
          <p className="text-white/80 text-lg mb-8">Save time and money with thousands of promo codes for your favorite stores</p>
          
          <div className="relative">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row">
              <div className="flex-grow mb-2 md:mb-0 md:mr-2">
                <Input
                  type="text"
                  placeholder="Search for stores, brands or coupons..."
                  className="w-full px-4 py-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 h-auto"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="bg-secondary hover:bg-secondary/90 text-white font-medium py-3 px-6 h-auto"
              >
                <i className="fas fa-search mr-2"></i> Find Savings
              </Button>
            </form>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-white/80 self-center">Popular:</span>
              {popularSearches.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handlePopularSearch(item.search)}
                  className="text-sm bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition-colors"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
