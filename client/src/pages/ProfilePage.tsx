import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfileOnboarding } from "@/components/profile/UserProfileOnboarding";
import { WithdrawModal } from "@/components/profile/WithdrawModal";
import { PointsHistory } from "@/components/PointsHistory";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Edit, PlusCircle, Clock, CheckCircle, XCircle, CreditCard, History, CoinIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, UserSubmittedCouponWithRelations, WithdrawalRequestWithUser } from "@shared/schema";
import { format } from "date-fns";
import { Link } from "wouter";

export default function ProfilePage() {
  const { currentUser, isAdmin } = useAuth();
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  // Fetch user data from API to get the latest preferences
  const { data: userData, isLoading: isLoadingUser, error: userError } = useQuery({
    queryKey: currentUser?.uid ? [`/api/users/${currentUser.uid}`] : ['no-user'],
    queryFn: async () => {
      if (!currentUser?.uid) return null;
      
      try {
        // Try to fetch the user
        const response = await fetch(`/api/users/${currentUser.uid}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // User doesn't exist, create them
            console.log("User not found in database, creating user...");
            const createResponse = await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                firebaseUid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
                photoURL: currentUser.photoURL,
              }),
            });
            
            if (!createResponse.ok) {
              throw new Error(`Failed to create user: ${createResponse.status}`);
            }
            
            return await createResponse.json();
          }
          throw new Error(`Failed to fetch user: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error in user data fetch:", error);
        throw error;
      }
    },
    retry: 1
  });
  
  // Fetch user submitted coupons
  const { data: userCoupons = [], isLoading: isLoadingCoupons } = useQuery({
    queryKey: userData?.id ? ['/api/user-submitted-coupons', { userId: userData.id }] : ['no-coupons'],
    queryFn: async () => {
      if (!userData?.id) return [];
      
      try {
        const response = await fetch(`/api/user-submitted-coupons?userId=${userData.id}&sortBy=newest`);
        if (!response.ok) {
          throw new Error(`Failed to fetch user coupons: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching user coupons:", error);
        return [];
      }
    },
    enabled: !!userData?.id
  });
  
  useEffect(() => {
    // If user has not completed onboarding, show the onboarding component
    if (userData && !userData.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [userData]);
  
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };
  
  if (!currentUser) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view your profile</h1>
        <p className="text-muted-foreground mb-8">You need to be logged in to access this page.</p>
      </div>
    );
  }
  
  if (isLoadingUser) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (showOnboarding) {
    return <UserProfileOnboarding onComplete={handleOnboardingComplete} />;
  }
  
  // Parse stored preferences
  const preferredCategories = userData?.preferredCategories || [];
  const preferredStores = userData?.preferredStores || [];
  
  // Count submitted coupons by status
  const pendingCount = Array.isArray(userCoupons) ? userCoupons.filter(c => c.status === 'pending').length : 0;
  const approvedCount = Array.isArray(userCoupons) ? userCoupons.filter(c => c.status === 'approved').length : 0;
  const rejectedCount = Array.isArray(userCoupons) ? userCoupons.filter(c => c.status === 'rejected').length : 0;
  
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile information */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={currentUser.photoURL || undefined} />
                <AvatarFallback>
                  {currentUser.displayName?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{currentUser.displayName || 'User'}</CardTitle>
                <CardDescription>{currentUser.email}</CardDescription>
                {isAdmin && (
                  <Badge variant="secondary" className="mt-1">Admin</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Member since</h3>
                <p>{userData?.createdAt ? format(new Date(userData.createdAt), 'MMMM d, yyyy') : 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Coupon submissions</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {pendingCount} pending
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 bg-green-50">
                    <CheckCircle className="w-3 h-3 text-green-500" /> {approvedCount} approved
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 bg-red-50">
                    <XCircle className="w-3 h-3 text-red-500" /> {rejectedCount} rejected
                  </Badge>
                </div>
              </div>
              
              <div className="pt-4">
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    asChild
                  >
                    <Link to="/withdrawals">
                      <History className="h-4 w-4 mr-2" />
                      View Withdrawal History
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    asChild
                  >
                    <Link to="/submit-coupon">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Submit new coupon
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>

          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Points Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">Current Points</p>
                  <p className="text-2xl font-bold text-primary">{userData?.points || 0}</p>
                </div>
                <Separator className="my-2" />
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• Earn 10 points when you sign up</p>
                  <p>• Earn 5 points for each approved coupon</p>
                  <p>• Minimum withdrawal: 1000 points</p>
                </div>
                
                <Button 
                  onClick={() => setShowWithdrawModal(true)}
                  className="w-full mt-2"
                  variant="outline"
                  size="sm"
                  disabled={(userData?.points || 0) < 1000}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {(userData?.points || 0) >= 1000 ? "Withdraw Points" : "Insufficient Points"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </Card>
        
        {/* Tabs container for content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="submitted" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="submitted">My Submissions</TabsTrigger>
              <TabsTrigger value="points">Points History</TabsTrigger>
              <TabsTrigger value="preferences">My Preferences</TabsTrigger>
            </TabsList>
            
            {/* Submitted coupons tab */}
            <TabsContent value="submitted" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Coupon Submissions</CardTitle>
                  <CardDescription>
                    Coupons you've submitted for review. Approved coupons will appear on the site.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingCoupons ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : !Array.isArray(userCoupons) || userCoupons.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">You haven't submitted any coupons yet</p>
                      <Button asChild>
                        <Link to="/submit-coupon">
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Submit your first coupon
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userCoupons.map((coupon: UserSubmittedCouponWithRelations) => (
                        <Card key={coupon.id} className="overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            <div className="p-4 flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold">{coupon.title}</h3>
                                  <p className="text-sm text-muted-foreground">{coupon.description}</p>
                                </div>
                                {coupon.status === 'pending' && (
                                  <Badge variant="outline" className="ml-2 bg-yellow-50">
                                    <Clock className="w-3 h-3 mr-1 text-yellow-500" /> Pending
                                  </Badge>
                                )}
                                {coupon.status === 'approved' && (
                                  <Badge variant="outline" className="ml-2 bg-green-50">
                                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" /> Approved
                                  </Badge>
                                )}
                                {coupon.status === 'rejected' && (
                                  <Badge variant="outline" className="ml-2 bg-red-50">
                                    <XCircle className="w-3 h-3 mr-1 text-red-500" /> Rejected
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="mt-2 flex items-center text-sm">
                                {coupon.store ? (
                                  <>
                                    <img 
                                      src={coupon.store.logo || ''} 
                                      alt={coupon.store.name || 'Store'} 
                                      className="w-4 h-4 mr-1 object-contain"
                                      onError={(e) => {
                                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(coupon.store.name || 'Store')}&background=random&size=16`;
                                      }}
                                    />
                                    <span className="mr-2">{coupon.store.name || 'Unknown Store'}</span>
                                  </>
                                ) : (
                                  <span className="mr-2 text-muted-foreground">Store information not available</span>
                                )}
                                <span className="text-muted-foreground">
                                  Submitted {format(new Date(coupon.submittedAt || new Date()), 'MMM d, yyyy')}
                                </span>
                              </div>
                              
                              {coupon.reviewNotes && (
                                <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                                  <p className="font-semibold">Review notes:</p>
                                  <p>{coupon.reviewNotes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Points History tab */}
            <TabsContent value="points" className="space-y-4">
              {userData?.id && <PointsHistory />}
            </TabsContent>
            
            {/* Preferences tab */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>My Preferences</CardTitle>
                    <CardDescription>
                      Update your preferences to get personalized coupon recommendations
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowOnboarding(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Preferred categories */}
                    <div>
                      <h3 className="font-semibold mb-3">Preferred Categories</h3>
                      {preferredCategories.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No preferred categories selected</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {/* We'd need to fetch full category details to display names */}
                          {preferredCategories.map((id: number) => (
                            <Badge key={id} variant="secondary">Category #{id}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Preferred stores */}
                    <div>
                      <h3 className="font-semibold mb-3">Preferred Stores</h3>
                      {preferredStores.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No preferred stores selected</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {/* We'd need to fetch full store details to display names */}
                          {preferredStores.map((id: number) => (
                            <Badge key={id} variant="secondary">Store #{id}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Withdrawal modal */}
      {userData && (
        <WithdrawModal
          open={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          user={userData}
        />
      )}
    </div>
  );
}