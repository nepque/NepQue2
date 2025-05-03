import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Category, Store } from '@shared/schema';
import { Loader2 } from 'lucide-react';

export const UserProfileOnboarding = ({ onComplete }: { onComplete: () => void }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedStores, setSelectedStores] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories and stores with counts
  const { data: categoriesWithCount = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/categories/with-counts'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/categories/with-counts');
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    }
  });

  const { data: storesWithCount = [], isLoading: isLoadingStores } = useQuery({
    queryKey: ['/api/stores/with-counts'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/stores/with-counts');
        if (!response.ok) {
          throw new Error(`Failed to fetch stores: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching stores:", error);
        return [];
      }
    }
  });

  // Toggle category selection
  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  // Toggle store selection
  const toggleStore = (storeId: number) => {
    setSelectedStores(prev => 
      prev.includes(storeId) 
        ? prev.filter(id => id !== storeId) 
        : [...prev, storeId]
    );
  };

  // Save preferences
  const savePreferences = async () => {
    if (!currentUser) return;
    
    setIsSubmitting(true);
    try {
      // First, try to get or create the user in our database
      let userData;
      
      try {
        // Try to fetch the user from our DB using Firebase UID
        const response = await fetch(`/api/users/${currentUser.uid}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.status}`);
        }
        userData = await response.json();
      } catch (err) {
        console.log("User not found or error fetching, creating user...", err);
        // User doesn't exist, create them
        const createResponse = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
        
        userData = await createResponse.json();
      }
      
      console.log("User data:", userData);
      
      if (!userData || typeof userData.id === 'undefined') {
        throw new Error("Could not find or create user data");
      }
      
      // Then update preferences using the database ID
      const updateResponse = await fetch(`/api/users/${userData.id}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredCategories: selectedCategories,
          preferredStores: selectedStores,
          hasCompletedOnboarding: true
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Failed to update preferences: ${updateResponse.status}`);
      }
      
      const updatedData = await updateResponse.json();
      
      // Invalidate user query cache
      queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUser.uid}`] });
      
      toast({
        title: "Preferences saved!",
        description: "Your profile has been updated with your preferences."
      });
      
      // Notify parent component that onboarding is complete
      onComplete();
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Failed to save preferences",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Limit to top 6 categories and stores for display
  const topCategories = Array.isArray(categoriesWithCount) ? categoriesWithCount.slice(0, 6) : [];
  const topStores = Array.isArray(storesWithCount) ? storesWithCount.slice(0, 6) : [];

  if (isLoadingCategories || isLoadingStores) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to NepQue!</CardTitle>
          <CardDescription>Help us personalize your experience by selecting your preferences</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Category preferences */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories you're interested in</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {topCategories.map((category: any) => (
                <div key={category.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <div className="grid gap-1.5">
                    <Label 
                      htmlFor={`category-${category.id}`}
                      className="font-medium cursor-pointer flex items-center"
                    >
                      <span className={`w-3 h-3 rounded-full bg-${category.color}-500 mr-2`}></span>
                      {category.name}
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {category.couponCount} coupons
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Store preferences */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stores you shop at</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {topStores.map((store: any) => (
                <div key={store.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={`store-${store.id}`}
                    checked={selectedStores.includes(store.id)}
                    onCheckedChange={() => toggleStore(store.id)}
                  />
                  <div className="grid gap-1.5">
                    <Label 
                      htmlFor={`store-${store.id}`}
                      className="font-medium cursor-pointer flex items-center"
                    >
                      <img 
                        src={store.logo} 
                        alt={store.name} 
                        className="w-4 h-4 mr-2 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=random&size=32`;
                        }}
                      />
                      {store.name}
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {store.couponCount} coupons
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onComplete}
          >
            Skip for now
          </Button>
          <Button 
            onClick={savePreferences}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving
              </>
            ) : 'Save preferences'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};