import { useState } from "react";
import { Link } from "wouter";
import { formatDistanceToNow, format, isPast, isToday, addDays, isTomorrow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { CouponWithRelations } from "@shared/schema";

interface CouponCardProps {
  coupon: CouponWithRelations;
  onShowCode: () => void;
}

const CouponCard = ({ coupon, onShowCode }: CouponCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent clicking through to the coupon
    setIsFavorite(!isFavorite);
  };

  const formatExpiration = (date: string | Date) => {
    const expiryDate = new Date(date);
    
    if (isPast(expiryDate) && !isToday(expiryDate)) {
      return "Expired";
    } else if (isToday(expiryDate)) {
      return "Today";
    } else if (isTomorrow(expiryDate)) {
      return "Tomorrow";
    } else if (addDays(new Date(), 7) > expiryDate) {
      return formatDistanceToNow(expiryDate, { addSuffix: true });
    } else {
      return format(expiryDate, "MMM d, yyyy");
    }
  };

  const isExpiringSoon = (date: string | Date) => {
    const expiryDate = new Date(date);
    return !isPast(expiryDate) && addDays(new Date(), 3) > expiryDate;
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // Get color for category badge
  const getCategoryColor = (categoryId: number) => {
    switch (categoryId) {
      case 1: // Retail
        return "bg-blue-100 text-primary";
      case 2: // Fashion
        return "bg-green-100 text-green-600";
      case 3: // Electronics
        return "bg-blue-100 text-primary";
      case 4: // Food
        return "bg-red-100 text-red-600";
      case 5: // Travel
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between border-b border-neutral-100 p-4">
        <Link href={`/store/${coupon.store.slug}`} className="flex items-center hover:opacity-90">
          <img 
            src={coupon.store.logo} 
            alt={coupon.store.name} 
            className="w-12 h-12 object-contain rounded-md border border-neutral-100"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(coupon.store.name)}&background=random&size=48`;
            }}
          />
          <div className="ml-3">
            <h3 className="font-semibold text-neutral-800">{coupon.store.name}</h3>
            <div className="flex items-center mt-1">
              <span 
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/category/${coupon.category.slug}`;
                }}
                className={`text-xs font-medium px-2 py-0.5 ${getCategoryColor(coupon.categoryId)} rounded-full cursor-pointer`}
              >
                {coupon.category.name}
              </span>
            </div>
          </div>
        </Link>
        <button 
          onClick={toggleFavorite}
          className={`${isFavorite ? 'text-secondary' : 'text-neutral-400 hover:text-secondary'}`}
        >
          <Heart className={isFavorite ? "fill-current" : ""} size={18} />
        </button>
      </div>
      <div className="p-4">
        {coupon.verified && (
          <Badge variant="outline" className="bg-green-100 text-success border-0 mb-2">
            <i className="fas fa-check-circle mr-1"></i> Verified
          </Badge>
        )}
        {isExpiringSoon(coupon.expiresAt) && (
          <Badge variant="outline" className="bg-red-100 text-error border-0 mb-2">
            <i className="fas fa-fire-alt mr-1"></i> Expiring Soon
          </Badge>
        )}
        <p className="font-medium text-neutral-800 mb-2">{coupon.title}</p>
        <p className="text-sm text-neutral-500 mb-3">{coupon.description}</p>
        <div className="flex items-center text-sm text-neutral-500 mb-4">
          <i className="far fa-clock mr-1.5"></i>
          <span>Expires: 
            <span className={`${isExpiringSoon(coupon.expiresAt) ? 'text-error' : 'text-neutral-600'} font-medium ml-1`}>
              {formatExpiration(coupon.expiresAt)}
            </span>
          </span>
          <span className="mx-2 text-neutral-300">•</span>
          <span>Used {formatCount(coupon.usedCount || 0)} times</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Button 
              onClick={onShowCode}
              className="w-full bg-secondary hover:bg-secondary/90 text-white font-medium py-2.5 px-4 rounded transition-colors"
            >
              Show Code
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponCard;
