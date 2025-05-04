import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { BannerAd as BannerAdType } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

interface BannerAdProps {
  location: string;
  className?: string;
}

/**
 * BannerAd component displays a 700x90 px banner advertisement
 * Banners are targeted to specific locations on the site
 */
export const BannerAd: React.FC<BannerAdProps> = ({ location, className = '' }) => {
  const [randomBanner, setRandomBanner] = useState<BannerAdType | null>(null);

  // Fetch active banner ads for this location
  const { data: bannerAds, isLoading, isError } = useQuery({
    queryKey: ['/api/banner-ads', location],
    queryFn: async () => {
      const response = await fetch(`/api/banner-ads?location=${location}&isActive=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch banner ads');
      }
      return response.json();
    },
    // Cache for 15 minutes to prevent too frequent refetching
    staleTime: 15 * 60 * 1000,
  });

  // Pick a random banner from available banners for this location
  useEffect(() => {
    if (bannerAds && bannerAds.length > 0) {
      const randomIndex = Math.floor(Math.random() * bannerAds.length);
      setRandomBanner(bannerAds[randomIndex]);
      console.log("Selected banner ad:", bannerAds[randomIndex]);
    } else {
      setRandomBanner(null);
      console.log("No banner ads available for location:", location);
    }
  }, [bannerAds, location]);

  // Track banner ad click
  const handleBannerClick = () => {
    if (randomBanner) {
      // Optional: Track banner clicks in analytics or increment click count
      console.log(`Banner clicked: ${randomBanner.id} - ${randomBanner.title}`);
      
      // If linkUrl exists, track and navigate
      if (randomBanner.linkUrl) {
        // Open the link in a new tab
        window.open(randomBanner.linkUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`w-full max-w-[700px] h-[90px] rounded overflow-hidden ${className}`}>
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  // Error or no banners available
  if (isError || !randomBanner) {
    console.log("Banner ad not displayed due to error or no banner available");
    return null;
  }

  // If banner has an image URL, display just the image
  if (randomBanner.imageUrl) {
    return (
      <div 
        className={`relative w-full max-w-[700px] h-[90px] rounded overflow-hidden shadow-md ${className}`}
        onClick={handleBannerClick}
        style={{ cursor: randomBanner.linkUrl ? 'pointer' : 'default' }}
      >
        <img 
          src={randomBanner.imageUrl} 
          alt={randomBanner.title} 
          className="w-full h-full object-fill" 
        />
        
        {/* Ad indicator */}
        <div className="absolute top-1 right-1 bg-black/40 text-white text-xs px-1 rounded">
          Ad
        </div>
      </div>
    );
  }

  // Fallback to gradient background with text overlay
  return (
    <div 
      className={`relative w-full max-w-[700px] h-[90px] rounded overflow-hidden shadow-md ${className}`}
      onClick={handleBannerClick}
      style={{ cursor: randomBanner.linkUrl ? 'pointer' : 'default' }}
    >
      {/* Banner background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500" />
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-center p-4 text-white">
        <h3 className="text-lg font-bold">{randomBanner.title}</h3>
        {randomBanner.description && (
          <p className="text-sm">{randomBanner.description}</p>
        )}
      </div>
      
      {/* Ad indicator */}
      <div className="absolute top-1 right-1 bg-black/40 text-white text-xs px-1 rounded">
        Ad
      </div>
    </div>
  );
};

export default BannerAd;