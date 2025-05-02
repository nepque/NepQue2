import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CouponWithRelations } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isPast, isToday } from "date-fns";
import { Clipboard, Check, Flag, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const CouponDetailPage = () => {
  const [match, params] = useRoute("/coupon/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  // Redirect if no match
  useEffect(() => {
    if (!match) {
      navigate("/coupons", { replace: true });
    }
  }, [match, navigate]);

  // Fetch coupon data
  const { data: coupon, isLoading } = useQuery<CouponWithRelations>({
    queryKey: [`/api/coupons/${params?.id}`],
    queryFn: async () => {
      if (!params?.id) throw new Error("Coupon ID is required");
      const response = await fetch(`/api/coupons/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          navigate("/coupons", { replace: true });
          throw new Error("Coupon not found");
        }
        throw new Error("Failed to fetch coupon");
      }
      return response.json();
    },
    enabled: !!params?.id
  });

  const formatExpiryDate = (date: string | Date) => {
    const expiryDate = new Date(date);
    
    if (isPast(expiryDate) && !isToday(expiryDate)) {
      return "Expired";
    }
    
    return format(expiryDate, "MMM d, yyyy");
  };

  const handleCopyCode = async () => {
    if (!coupon) return;
    
    try {
      await navigator.clipboard.writeText(coupon.code);
      setIsCopied(true);
      
      // Record usage
      await apiRequest("POST", `/api/coupons/${coupon.id}/use`, {});
      
      // Invalidate queries to refetch with updated usage count
      queryClient.invalidateQueries({ queryKey: [`/api/coupons/${coupon.id}`] });
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

  const handleBack = () => {
    navigate("/coupons");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-8 w-40 mb-6" />
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Skeleton className="w-16 h-16 rounded-md mr-4" />
              <div>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-5 w-full mb-6" />
            <Skeleton className="h-20 w-full mb-6" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!coupon) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 pl-0" 
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to coupons
        </Button>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Store header */}
          <div className="bg-primary/5 p-6 border-b">
            <div className="flex items-center">
              <img 
                src={coupon.store.logo} 
                alt={coupon.store.name} 
                className="w-16 h-16 object-contain rounded-md border border-neutral-200 bg-white mr-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(coupon.store.name)}&background=random&size=64`;
                }}
              />
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">{coupon.store.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="bg-blue-100 text-primary border-0">
                    {coupon.category.name}
                  </Badge>
                  {coupon.verified && (
                    <Badge variant="outline" className="bg-green-100 text-success border-0">
                      <i className="fas fa-check-circle mr-1"></i> Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Coupon details */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-neutral-800 mb-2">{coupon.title}</h2>
            <p className="text-neutral-600 mb-6">{coupon.description}</p>
            
            {/* Coupon code */}
            <div className="bg-neutral-100 rounded-md p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-neutral-800">Coupon Code</h3>
                <div className="flex items-center text-sm text-neutral-500">
                  <i className="far fa-clock mr-1.5"></i>
                  <span>Expires: <span className="text-neutral-600 font-medium">{formatExpiryDate(coupon.expiresAt)}</span></span>
                </div>
              </div>
              
              <div className="bg-white border border-neutral-200 rounded-md p-3 flex items-center justify-between">
                <div className="font-mono font-medium text-lg text-neutral-800">{coupon.code}</div>
                <Button
                  onClick={handleCopyCode}
                  className={isCopied ? "bg-success hover:bg-success/90" : "bg-primary hover:bg-primary/90"}
                >
                  {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Clipboard className="h-4 w-4 mr-2" />}
                  {isCopied ? "Copied" : "Copy Code"}
                </Button>
              </div>
              
              <p className="text-sm text-neutral-500 mt-3 text-center">
                Copy this code and paste it at checkout
              </p>
            </div>
            
            {/* Terms & details */}
            {coupon.terms && (
              <div className="mb-6">
                <h3 className="font-semibold text-neutral-800 mb-3">Details & Terms</h3>
                <div className="bg-neutral-50 border border-neutral-200 rounded-md p-4">
                  <ul className="text-sm text-neutral-600 space-y-2 pl-5 list-disc">
                    {coupon.terms.split('\n').map((term, index) => (
                      <li key={index}>{term}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Shop button */}
            <div className="mb-6">
              <a 
                href={coupon.store.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-secondary hover:bg-secondary/90 text-white font-medium py-3 px-4 rounded text-center transition-colors"
              >
                Shop Now at {coupon.store.name}
              </a>
            </div>
            
            {/* Usage info & actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-neutral-500 pt-4 border-t border-neutral-200">
              <div>
                <span>Used {coupon.usedCount} times</span>
              </div>
              <button 
                onClick={handleReportCoupon}
                className="mt-2 sm:mt-0 text-neutral-500 hover:text-neutral-700 flex items-center"
              >
                <Flag className="h-4 w-4 mr-1" /> Report Coupon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponDetailPage;
