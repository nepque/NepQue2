import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  type UserSubmittedCoupon, 
  type UserSubmittedCouponWithRelations, 
  type Store, 
  type Category 
} from "@shared/schema";

import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  code: z.string().min(1, "Coupon code is required"),
  storeId: z.string().min(1, "Please select a store"),
  categoryId: z.string().min(1, "Please select a category"),
  expiresAt: z.string().min(1, "Expiration date is required"),
  terms: z.string().optional(),
  reviewNotes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AdminSubmissionEdit = () => {
  const [match, params] = useRoute("/admin/submissions/edit/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Fetch user submitted coupon data to edit
  const { data: coupon, isLoading: isLoadingCoupon } = useQuery<UserSubmittedCouponWithRelations>({
    queryKey: ["/api/user-submitted-coupons", params?.id],
    queryFn: async () => {
      if (!params?.id) throw new Error("Coupon ID is required");
      const response = await fetch(`/api/user-submitted-coupons/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          navigate("/admin/submissions", { replace: true });
          throw new Error("User submitted coupon not found");
        }
        throw new Error("Failed to fetch user submitted coupon");
      }
      return response.json();
    },
    enabled: !!params?.id
  });
  
  // Fetch stores for select dropdown
  const { data: stores, isLoading: isLoadingStores } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
    queryFn: async () => {
      const response = await fetch("/api/stores");
      if (!response.ok) throw new Error("Failed to fetch stores");
      return response.json();
    },
  });
  
  // Fetch categories for select dropdown
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });
  
  // Form definition
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      code: "",
      storeId: "",
      categoryId: "",
      expiresAt: new Date().toISOString().split('T')[0],
      terms: "",
      reviewNotes: "",
    },
  });

  // Update form when coupon data is loaded
  useEffect(() => {
    if (coupon) {
      form.reset({
        title: coupon.title,
        description: coupon.description,
        code: coupon.code,
        storeId: coupon.storeId.toString(),
        categoryId: coupon.categoryId.toString(),
        expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        terms: coupon.terms || "",
        reviewNotes: coupon.reviewNotes || "",
      });
    }
  }, [coupon, form]);

  // Update user submitted coupon mutation
  const updateCoupon = useMutation({
    mutationFn: async (data: UserSubmittedCoupon) => {
      if (!params?.id) throw new Error("Coupon ID is required");
      
      // For user submitted coupons, we use the PATCH method to update only the fields we need
      return apiRequest(`/api/user-submitted-coupons/${params.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-submitted-coupons"] });
      toast({
        title: "Success",
        description: "Coupon updated successfully",
      });
      navigate("/admin/submissions");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update coupon: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user submitted coupon mutation
  const deleteCoupon = useMutation({
    mutationFn: async () => {
      if (!params?.id) throw new Error("Coupon ID is required");
      return apiRequest(`/api/user-submitted-coupons/${params.id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-submitted-coupons"] });
      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });
      navigate("/admin/submissions");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete coupon: " + error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!params?.id) {
      toast({
        title: "Error",
        description: "Coupon ID is required",
        variant: "destructive",
      });
      return;
    }
    
    const originalStatus = coupon?.status || 'pending';
    
    // Convert string values to appropriate types
    const couponData: UserSubmittedCoupon = {
      id: parseInt(params.id),
      title: data.title,
      description: data.description,
      code: data.code,
      storeId: parseInt(data.storeId),
      categoryId: parseInt(data.categoryId),
      userId: coupon?.userId || 0,
      status: originalStatus, // Preserve the original status
      expiresAt: new Date(data.expiresAt),
      submittedAt: coupon?.submittedAt || new Date(),
      terms: data.terms || null,
      reviewNotes: data.reviewNotes || null,
    };
    
    updateCoupon.mutate(couponData);
  };

  const handleDelete = () => {
    deleteCoupon.mutate();
  };

  if (isLoadingCoupon) {
    return (
      <AdminLayout title="Edit User Submission">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="mb-4">Loading coupon data...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!coupon) {
    return (
      <AdminLayout title="Edit User Submission">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="mb-4">Coupon not found</div>
            <Button onClick={() => navigate("/admin/submissions")}>
              Back to Submissions
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit User Submission">
      <div className="mb-6 flex justify-between items-center">
        <Button
          variant="ghost"
          className="pl-0 text-gray-600 hover:text-gray-900"
          onClick={() => navigate("/admin/submissions")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Submissions
        </Button>
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Delete Coupon
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user-submitted coupon
                and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <div className="inline-block px-3 py-1 rounded-full text-sm font-medium 
            bg-opacity-20 border
            ${coupon.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 
            coupon.status === 'approved' ? 'bg-green-100 text-green-800 border-green-300' : 
            'bg-red-100 text-red-800 border-red-300'}"
          >
            Status: {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
          </div>
          
          {coupon.user && (
            <div className="mt-2 text-sm text-gray-600">
              Submitted by: {coupon.user.displayName || coupon.user.email || 'Unknown User'}
            </div>
          )}
          
          <div className="mt-1 text-sm text-gray-600">
            Submitted on: {new Date(coupon.submittedAt).toLocaleDateString()}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 20% Off Electronics" {...field} />
                    </FormControl>
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
                      <Input placeholder="e.g. SUMMER20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the coupon" 
                      {...field} 
                      className="min-h-[100px]" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="storeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a store" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingStores ? (
                          <SelectItem value="loading" disabled>
                            Loading stores...
                          </SelectItem>
                        ) : stores && stores.length > 0 ? (
                          stores.map((store) => (
                            <SelectItem key={store.id} value={store.id.toString()}>
                              {store.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-stores" disabled>
                            No stores available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
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
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingCategories ? (
                          <SelectItem value="loading" disabled>
                            Loading categories...
                          </SelectItem>
                        ) : categories && categories.length > 0 ? (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-categories" disabled>
                            No categories available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms & Conditions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter any terms or conditions for using this coupon" 
                      {...field} 
                      className="min-h-[100px]" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reviewNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notes to the submitter about this coupon" 
                      {...field} 
                      className="min-h-[100px]" 
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">These notes will be visible to the user who submitted the coupon</p>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/submissions")}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updateCoupon.isPending}
                className="gap-1"
              >
                <Save className="h-4 w-4" />
                {updateCoupon.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
};

export default AdminSubmissionEdit;