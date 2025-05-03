import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Category, Store, insertUserSubmittedCouponSchema } from "@shared/schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AuthModal } from "@/components/auth/AuthModal";

// Extend the insert schema with client-side validation
const submitCouponSchema = insertUserSubmittedCouponSchema.extend({
  storeId: z.coerce.number().min(1, "Please select a store"),
  categoryId: z.coerce.number().min(1, "Please select a category"),
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  code: z.string().min(2, "Code must be at least 2 characters").max(50, "Code must be less than 50 characters"),
  terms: z.string().optional(),
  expiresAt: z.date({
    required_error: "Please select an expiration date",
  }).refine((date) => date > new Date(), {
    message: "Expiration date must be in the future",
  }),
});

type SubmitCouponFormValues = z.infer<typeof submitCouponSchema>;

export default function SubmitCouponPage() {
  const [, navigate] = useLocation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Fetch categories and stores
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/categories');
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
  // Ensure categories is always an array
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const { data: storesData, isLoading: isLoadingStores } = useQuery({
    queryKey: ['/api/stores'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/stores');
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
  // Ensure stores is always an array
  const stores = Array.isArray(storesData) ? storesData : [];
  
  // Form setup
  const form = useForm<SubmitCouponFormValues>({
    resolver: zodResolver(submitCouponSchema),
    defaultValues: {
      title: "",
      description: "",
      code: "",
      terms: "",
      expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Default: 1 month from now
    }
  });
  
  const onSubmit = async (data: SubmitCouponFormValues) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    
    console.log("Form submitted with data:", data);
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
        // User doesn't exist, create them
        console.log("User not found or error fetching, creating user...", err);
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
      
      // Convert date format to ISO string and ensure IDs are numbers
      const formattedData = {
        ...data,
        userId: userData.id,
        // Make sure expiresAt is formatted correctly as ISO string
        expiresAt: data.expiresAt instanceof Date ? data.expiresAt.toISOString() : data.expiresAt,
        // Convert string IDs to numbers
        storeId: data.storeId ? parseInt(data.storeId.toString(), 10) : undefined,
        categoryId: data.categoryId ? parseInt(data.categoryId.toString(), 10) : undefined
      };
      
      console.log("Submitting coupon data:", formattedData);
      
      const submitResponse = await fetch('/api/user-submitted-coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });
      
      if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        console.error("Submit response error:", errorText);
        throw new Error(`Failed to submit coupon: ${submitResponse.status} - ${errorText}`);
      }
      
      const result = await submitResponse.json();
      console.log("Submit response success:", result);
      
      toast({
        title: "Coupon submitted successfully!",
        description: "Your coupon has been submitted for review. You can check the status in your profile.",
      });
      
      // Redirect to profile page
      navigate("/profile");
    } catch (error) {
      console.error("Error submitting coupon:", error);
      toast({
        title: "Failed to submit coupon",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isLoading = isLoadingCategories || isLoadingStores;
  
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Submit a Coupon</CardTitle>
          <CardDescription>
            Share a coupon with the community. All submissions will be reviewed before being published.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={(event) => {
                event.preventDefault();
                console.log("Form submission handler triggered");
                form.handleSubmit(onSubmit)(event);
              }} className="space-y-6">
                <FormField
                  control={form.control}
                  name="storeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a store" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(stores) ? stores.map(store => (
                            <SelectItem key={store.id} value={store.id.toString()}>
                              {store.name}
                            </SelectItem>
                          )) : (
                            <SelectItem value="loading">Loading stores...</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the store this coupon is for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(categories) ? categories.map(category => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          )) : (
                            <SelectItem value="loading">Loading categories...</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the most appropriate category
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 20% Off Your First Order" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear, concise title describing the coupon
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the coupon and what it offers" 
                          {...field} 
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Provide more details about the coupon
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coupon Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. SAVE20" {...field} />
                      </FormControl>
                      <FormDescription>
                        The exact code users need to enter at checkout
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expiration Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When does this coupon expire?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms & Conditions (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any restrictions or special conditions for using this coupon" 
                          {...field} 
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Include any important details like minimum purchase, excluded items, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4">
                  <Button 
                    type="button" 
                    className="w-full"
                    disabled={isSubmitting}
                    onClick={() => {
                      console.log("Submit button clicked");
                      const formData = form.getValues();
                      console.log("Form data:", formData);
                      onSubmit(formData);
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : 'Submit Coupon'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <p>All submissions are subject to review by our moderators before being published.</p>
        </CardFooter>
      </Card>
      
      {/* Sign in modal if user tries to submit without being logged in */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}