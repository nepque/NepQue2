import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <i className="fas fa-ticket-alt text-secondary text-xl mr-2"></i>
              <span className="text-xl font-bold text-primary">CouponHub</span>
            </Link>
            <button 
              onClick={toggleMobileMenu} 
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <i className="fas fa-bars text-neutral-600"></i>
            </button>
          </div>
          
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:flex flex-col md:flex-row md:items-center mt-4 md:mt-0`}>
            <nav className="flex flex-col md:flex-row md:space-x-6">
              <Link href="/" className={`py-2 md:py-0 font-medium ${isActive('/') ? 'text-primary' : 'text-neutral-600 hover:text-primary'} border-b md:border-b-0 border-gray-100`}>
                Home
              </Link>
              <Link href="/coupons" className={`py-2 md:py-0 font-medium ${isActive('/coupons') ? 'text-primary' : 'text-neutral-600 hover:text-primary'} border-b md:border-b-0 border-gray-100`}>
                Coupons
              </Link>
              <Link href="/coupons?featured=true" className={`py-2 md:py-0 font-medium ${location.includes('featured=true') ? 'text-primary' : 'text-neutral-600 hover:text-primary'} border-b md:border-b-0 border-gray-100`}>
                Top Deals
              </Link>
            </nav>
            <div className="mt-4 md:mt-0 md:ml-6">
              <Button variant="default" className="bg-primary hover:bg-primary/90">
                <i className="fas fa-user mr-2"></i> Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
