import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Store } from "@shared/schema";

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
import { ArrowLeft, Save, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  logo: z.string().optional(),
  website: z.string().url("Must be a valid URL").min(1, "Website URL is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AdminStoreEdit = () => {
  const [match, params] = useRoute("/admin/stores/edit/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Fetch store data to edit
  const { data: store, isLoading: isLoadingStore } = useQuery<Store>({
    queryKey: ["/api/stores", params?.id],
    queryFn: async () => {
      if (!params?.id) throw new Error("Store ID is required");
      const response = await fetch(`/api/stores/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          navigate("/admin/stores", { replace: true });
          throw new Error("Store not found");
        }
        throw new Error("Failed to fetch store");
      }
      return response.json();
    },
    enabled: !!params?.id
  });
  
  // Form definition
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
      website: "https://",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    },
  });

  // Update form when store data is loaded
  useEffect(() => {
    if (store) {
      form.reset({
        name: store.name,
        slug: store.slug,
        logo: store.logo || "",
        website: store.website,
        metaTitle: store.metaTitle || "",
        metaDescription: store.metaDescription || "",
        metaKeywords: store.metaKeywords || "",
      });
    }
  }, [store, form]);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Update store mutation
  const updateStore = useMutation({
    mutationFn: async (storeData: Store) => {
      if (!params?.id) throw new Error("Store ID is required");
      return apiRequest(`/api/stores/${params.id}`, {
        method: "PUT",
        body: JSON.stringify(storeData),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stores/with-counts"] });
      toast({
        title: "Success",
        description: "Store updated successfully",
      });
      navigate("/admin/stores");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update store: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Delete store mutation
  const deleteStore = useMutation({
    mutationFn: async () => {
      if (!params?.id) throw new Error("Store ID is required");
      return apiRequest(`/api/stores/${params.id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stores/with-counts"] });
      toast({
        title: "Success",
        description: "Store deleted successfully",
      });
      navigate("/admin/stores");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete store: " + error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!params?.id) {
      toast({
        title: "Error",
        description: "Store ID is required",
        variant: "destructive",
      });
      return;
    }
    
    const storeData: Store = {
      id: parseInt(params.id),
      name: data.name,
      slug: data.slug,
      logo: data.logo || null,
      website: data.website,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      metaKeywords: data.metaKeywords || null,
    };
    
    updateStore.mutate(storeData);
  };

  const handleDelete = () => {
    deleteStore.mutate();
  };

  if (isLoadingStore) {
    return (
      <AdminLayout title="Edit Store">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="mb-4">Loading store data...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!store) {
    return (
      <AdminLayout title="Edit Store">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="mb-4">Store not found</div>
            <Button onClick={() => navigate("/admin/stores")}>
              Back to Stores
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Store">
      <div className="mb-6 flex justify-between items-center">
        <Button
          variant="ghost"
          className="pl-0 text-gray-600 hover:text-gray-900"
          onClick={() => navigate("/admin/stores")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Stores
        </Button>
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Delete Store
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the store
                and all associated coupons from our servers.
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Amazon" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        // Auto-generate slug when name changes and slug is empty or matches previous auto-generation
                        const currentSlug = form.getValues("slug");
                        const previousAutoSlug = generateSlug(field.value);
                        if (!currentSlug || currentSlug === previousAutoSlug) {
                          form.setValue("slug", generateSlug(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. amazon" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. https://amazon.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. https://logo.clearbit.com/amazon.com" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {store.logo && (
              <div className="p-4 border rounded-md">
                <p className="text-sm text-gray-500 mb-2">Current logo:</p>
                <div className="w-24 h-24 bg-white rounded border flex items-center justify-center p-2">
                  <img 
                    src={store.logo} 
                    alt={store.name} 
                    className="max-w-full max-h-full object-contain" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentNode as HTMLElement;
                      parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-2xl font-bold">${store.name.charAt(0).toUpperCase()}</div>`;
                    }}
                  />
                </div>
              </div>
            )}

            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mt-8 mb-4">SEO Settings</h3>
            
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={`${store.name} Coupons & Promo Codes - Save With NepQue`} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={`Find the best ${store.name} coupons, promo codes, and deals to save on your next purchase.`} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metaKeywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Keywords</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={`${store.name}, promo codes, coupons, discount codes, deals, vouchers, offers`} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-6 flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/admin/stores")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateStore.isPending}
              >
                {updateStore.isPending ? (
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

export default AdminStoreEdit;