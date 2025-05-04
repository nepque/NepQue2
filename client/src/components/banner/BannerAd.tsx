import React, { useEffect, useState } from 'react';
import { apiRequest } from '@lib/queryClient';
import { BannerAd as BannerAdType } from '@shared/schema';

interface BannerAdProps {
  location: string;
  className?: string;
}

/**
 * BannerAd component displays a 700x90 px banner advertisement
 * Banners are targeted to specific locations on the site
 */
export const BannerAd: React.FC<BannerAdProps> = ({ location, className = '' }) => {
  const [banner, setBanner] = useState<BannerAdType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const banners = await apiRequest<BannerAdType[]>(`/api/banner-ads?location=${location}`);
        
        if (banners && banners.length > 0) {
          // If multiple banners are available for this location, randomly select one
          const randomIndex = Math.floor(Math.random() * banners.length);
          setBanner(banners[randomIndex]);
        } else {
          // No banners available for this location
          setBanner(null);
        }
      } catch (err) {
        console.error('Error fetching banner ad:', err);
        setError('Unable to load banner advertisement');
      }
    };

    fetchBanner();
  }, [location]);

  const handleBannerClick = async () => {
    if (banner && banner.linkUrl) {
      // Open link in new tab
      window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
      
      // Optionally: record click analytics here
    }
  };

  if (error) {
    return null; // Don't show any error state for banner ads
  }

  if (!banner) {
    return null; // Don't render anything if no banner is available
  }

  return (
    <div 
      className={`relative w-full max-w-[700px] h-[90px] mx-auto rounded-md overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer ${className}`}
      onClick={handleBannerClick}
    >
      {/* Banner with gradient background as fallback */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500"
        style={{ 
          backgroundImage: banner.imageUrl ? `url(${banner.imageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-center p-4 text-white">
        <h3 className="text-lg font-bold">{banner.title}</h3>
        <p className="text-sm">{banner.description}</p>
      </div>
      
      {/* Optional "Ad" indicator */}
      <div className="absolute top-1 right-1 bg-black/40 text-white text-xs px-1 rounded">
        Ad
      </div>
    </div>
  );
};

export default BannerAd;