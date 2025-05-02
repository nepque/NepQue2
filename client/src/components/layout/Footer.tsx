import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <i className="fas fa-ticket-alt text-secondary text-xl mr-2"></i>
              <span className="text-xl font-bold text-white">CouponHub</span>
            </div>
            <p className="text-neutral-400 mb-4">Your one-stop destination for the best coupons and deals online, helping you save on every purchase.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <i className="fab fa-pinterest-p"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-neutral-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/coupons" className="text-neutral-400 hover:text-white transition-colors">
                  Coupons
                </Link>
              </li>
              <li>
                <Link href="/coupons?featured=true" className="text-neutral-400 hover:text-white transition-colors">
                  Top Deals
                </Link>
              </li>
              <li>
                <Link href="/coupons?sortBy=expiring" className="text-neutral-400 hover:text-white transition-colors">
                  Expiring Soon
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/coupons?categoryId=1" className="text-neutral-400 hover:text-white transition-colors">
                  Retail
                </Link>
              </li>
              <li>
                <Link href="/coupons?categoryId=2" className="text-neutral-400 hover:text-white transition-colors">
                  Fashion
                </Link>
              </li>
              <li>
                <Link href="/coupons?categoryId=3" className="text-neutral-400 hover:text-white transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/coupons?categoryId=4" className="text-neutral-400 hover:text-white transition-colors">
                  Food & Dining
                </Link>
              </li>
              <li>
                <Link href="/coupons?categoryId=5" className="text-neutral-400 hover:text-white transition-colors">
                  Travel
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Help & Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 pt-6 mt-6 text-center">
          <p className="text-neutral-400 text-sm">© {new Date().getFullYear()} CouponHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
