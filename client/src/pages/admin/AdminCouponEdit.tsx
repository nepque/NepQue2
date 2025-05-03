import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  type Coupon, 
  type CouponWithRelations, 
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
import { Checkbox } from "@/components/ui/checkbox";
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
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  terms: z.string().optional(),
  usedCount: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const AdminCouponEdit = () => {
  const [match, params] = useRoute("/admin/coupons/edit/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Fetch coupon data to edit
  const { data: coupon, isLoading: isLoadingCoupon } = useQuery<CouponWithRelations>({
    queryKey: ["/api/coupons", params?.id],
    queryFn: async () => {
      if (!params?.id) throw new Error("Coupon ID is required");
      const response = await fetch(`/api/coupons/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          navigate("/admin/coupons", { replace: true });
          throw new Error("Coupon not found");
        }
        throw new Error("Failed to fetch coupon");
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
      featured: false,
      verified: false,
      terms: "",
      usedCount: "0",
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
        expiresAt: new Date(coupon.expiresAt).toISOString().split('T')[0],
        featured: coupon.featured === true,
        verified: coupon.verified === true,
        terms: coupon.terms || "",
        usedCount: (coupon.usedCount || 0).toString(),
      });
    }
  }, [coupon, form]);

  // Update coupon mutation
  const updateCoupon = useMutation({
    mutationFn: async (couponData: Coupon) => {
      if (!params?.id) throw new Error("Coupon ID is required");
      return apiRequest(`/api/coupons/${params.id}`, {
        method: "PUT",
        body: JSON.stringify(couponData),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      toast({
        title: "Success",
        description: "Coupon updated successfully",
      });
      navigate("/admin/coupons");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update coupon: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Delete coupon mutation
  const deleteCoupon = useMutation({
    mutationFn: async () => {
      if (!params?.id) throw new Error("Coupon ID is required");
      return apiRequest(`/api/coupons/${params.id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });
      navigate("/admin/coupons");
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
    
    // Convert string values to appropriate types
    const couponData: Coupon = {
      id: parseInt(params.id),
      title: data.title,
      description: data.description,
      code: data.code,
      storeId: parseInt(data.storeId),
      categoryId: parseInt(data.categoryId),
      expiresAt: new Date(data.expiresAt),
      featured: data.featured || false,
      verified: data.verified || false,
      terms: data.terms || null,
      usedCount: parseInt(data.usedCount) || 0,
    };
    
    updateCoupon.mutate(couponData);
  };

  const handleDelete = () => {
    deleteCoupon.mutate();
  };

  if (isLoadingCoupon) {
    return (
      <AdminLayout title="Edit Coupon">
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
      <AdminLayout title="Edit Coupon">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="mb-4">Coupon not found</div>
            <Button onClick={() => navigate("/admin/coupons")}>
              Back to Coupons
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Coupon">
      <div className="mb-6 flex justify-between items-center">
        <Button
          variant="ghost"
          className="pl-0 text-gray-600 hover:text-gray-900"
          onClick={() => navigate("/admin/coupons")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Coupons
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
                This action cannot be undone. This will permanently delete the coupon
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

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                name="usedCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Used Count</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured</FormLabel>
                      <p className="text-sm text-gray-500">
                        Featured coupons are displayed prominently on the homepage
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="verified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Verified</FormLabel>
                      <p className="text-sm text-gray-500">
                        Verified coupons are shown with a verification badge
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/admin/coupons")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateCoupon.isPending}
              >
                {updateCoupon.isPending ? (
                  "Updating..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
};

export default AdminCouponEdit;