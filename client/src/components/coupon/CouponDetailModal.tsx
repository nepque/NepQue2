import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Clipboard, Check, Flag } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { CouponWithRelations } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface CouponDetailModalProps {
  coupon: CouponWithRelations;
  onClose: () => void;
}

const CouponDetailModal = ({ coupon, onClose }: CouponDetailModalProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.id === "coupon-modal-backdrop") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    // Lock body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const formatExpiryDate = (date: string | Date) => {
    const expiryDate = new Date(date);
    
    if (isPast(expiryDate) && !isToday(expiryDate)) {
      return "Expired";
    }
    
    return format(expiryDate, "MMM d, yyyy");
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setIsCopied(true);
      
      // Record usage
      await apiRequest("POST", `/api/coupons/${coupon.id}/use`, {});
      
      // Invalidate queries to refetch with updated usage count
      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      
      toast({
        description: "Coupon code copied to clipboard",
      });
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try copying manually",
        variant: "destructive",
      });
    }
  };

  const handleReportCoupon = () => {
    toast({
      title: "Coupon reported",
      description: "Thank you for helping us maintain coupon quality",
    });
  };

  return (
    <div 
      id="coupon-modal-backdrop"
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
    >
      <div className="bg-white rounded-lg max-w-md w-full mx-4 md:mx-auto overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-200 p-4">
          <div className="flex items-center">
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
                <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 text-primary rounded-full">
                  {coupon.category.name}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            {coupon.verified && (
              <Badge variant="outline" className="bg-green-100 text-success border-0 mb-2">
                <i className="fas fa-check-circle mr-1"></i> Verified
              </Badge>
            )}
            <h4 className="font-medium text-neutral-800 text-lg">{coupon.title}</h4>
            <p className="text-neutral-600 mt-2">{coupon.description}</p>
          </div>
          
          <div className="bg-neutral-100 rounded-md p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-500">Coupon Code:</span>
              {coupon.verified && (
                <span className="text-xs text-white bg-success px-1.5 py-0.5 rounded">Verified</span>
              )}
            </div>
            <div className="flex items-center justify-between bg-white border border-neutral-200 rounded p-2">
              <span className="font-mono font-medium text-neutral-800">{coupon.code}</span>
              <Button
                onClick={handleCopyCode}
                size="sm"
                className={isCopied ? "bg-success hover:bg-success/90" : "bg-primary hover:bg-primary/90"}
              >
                {isCopied ? <Check className="h-4 w-4 mr-1" /> : <Clipboard className="h-4 w-4 mr-1" />}
                {isCopied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
          
          {coupon.terms && (
            <div className="border-t border-neutral-200 pt-4 mb-4">
              <h5 className="font-medium text-neutral-800 mb-2">Details & Terms</h5>
              <ul className="text-sm text-neutral-600 space-y-2 pl-5 list-disc">
                {coupon.terms.split('\n').map((term, index) => (
                  <li key={index}>{term}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex items-center text-sm text-neutral-500 mb-4">
            <i className="far fa-clock mr-1.5"></i>
            <span>Expires: <span className="text-neutral-600 font-medium">{formatExpiryDate(coupon.expiresAt)}</span></span>
            <span className="mx-2 text-neutral-300">•</span>
            <span>Used {coupon.usedCount} times</span>
          </div>
          
          <a 
            href={coupon.store.website}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-secondary hover:bg-secondary/90 text-white font-medium py-3 px-4 rounded text-center transition-colors"
          >
            Shop Now at {coupon.store.name}
          </a>
          
          <div className="mt-4 text-center">
            <button 
              onClick={handleReportCoupon}
              className="text-neutral-500 hover:text-neutral-700 text-sm flex items-center justify-center mx-auto"
            >
              <Flag className="h-4 w-4 mr-1" /> Report Coupon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponDetailModal;
