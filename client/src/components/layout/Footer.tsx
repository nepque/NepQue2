import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Pin, LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ContentPageData {
  id: number;
  slug: string;
  title: string;
  isPublished: boolean;
}

interface SocialMediaLinkData {
  id: number;
  platform: string;
  icon: string;
  url: string;
  isActive: boolean;
}

// Helper function to dynamically get Lucide icon component
const getDynamicIcon = (iconName: string): LucideIcon => {
  // Default to the Pin icon if the requested icon doesn't exist
  return (LucideIcons as any)[iconName] || Pin;
};

const Footer = () => {
  // Fetch published content pages to display in the footer
  const { data: contentPages } = useQuery({
    queryKey: ['/api/pages'],
    queryFn: async () => {
      const response = await fetch('/api/pages');
      if (!response.ok) {
        return [];
      }
      return response.json() as Promise<ContentPageData[]>;
    }
  });
  
  // Fetch social media links
  const { data: socialMediaLinks } = useQuery({
    queryKey: ['/api/social-media-links'],
    queryFn: async () => {
      const response = await fetch('/api/social-media-links');
      if (!response.ok) {
        return [];
      }
      return response.json() as Promise<SocialMediaLinkData[]>;
    }
  });

  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <span className="text-xl font-bold text-white">NepQue</span>
            </div>
            <p className="text-neutral-400 mb-4">Your one-stop destination for the best coupons and deals online, helping you save on every purchase.</p>
            <div className="flex space-x-4">
              {socialMediaLinks && socialMediaLinks.length > 0 ? (
                // Display dynamic social media links
                socialMediaLinks
                  .filter(link => link.isActive)
                  .map(link => {
                    const IconComponent = getDynamicIcon(link.icon);
                    return (
                      <a 
                        key={link.id}
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title={link.platform}
                        className="text-neutral-400 hover:text-white transition-colors"
                      >
                        <IconComponent className="h-5 w-5" />
                      </a>
                    );
                  })
              ) : (
                // Fallback to default social icons if no links are configured
                <>
                  <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                    <Pin className="h-5 w-5" />
                  </a>
                </>
              )}
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
                <Link href="/about" className="text-neutral-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-neutral-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-neutral-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-neutral-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              
              {/* Dynamic content pages */}
              {contentPages && contentPages.length > 0 && contentPages
                .filter(page => page.isPublished)
                .map(page => (
                  <li key={page.id}>
                    <Link 
                      href={`/${page.slug}`} 
                      className="text-neutral-400 hover:text-white transition-colors"
                    >
                      {page.title}
                    </Link>
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 pt-6 mt-6 text-center">
          <p className="text-neutral-400 text-sm">© {new Date().getFullYear()} NepQue. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
