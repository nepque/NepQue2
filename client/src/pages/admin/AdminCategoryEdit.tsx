import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Category } from "@shared/schema";

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
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
});

type FormValues = z.infer<typeof formSchema>;

const AdminCategoryEdit = () => {
  const [match, params] = useRoute("/admin/categories/edit/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Fetch category data to edit
  const { data: category, isLoading: isLoadingCategory } = useQuery<Category>({
    queryKey: ["/api/categories", params?.id],
    queryFn: async () => {
      if (!params?.id) throw new Error("Category ID is required");
      const response = await fetch(`/api/categories/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          navigate("/admin/categories", { replace: true });
          throw new Error("Category not found");
        }
        throw new Error("Failed to fetch category");
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
      icon: "tag",
      color: "blue",
    },
  });

  // Update form when category data is loaded
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        color: category.color,
      });
    }
  }, [category, form]);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Update category mutation
  const updateCategory = useMutation({
    mutationFn: async (categoryData: Category) => {
      if (!params?.id) throw new Error("Category ID is required");
      return apiRequest(`/api/categories/${params.id}`, {
        method: "PUT",
        body: JSON.stringify(categoryData),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories/with-counts"] });
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      navigate("/admin/categories");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update category: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategory = useMutation({
    mutationFn: async () => {
      if (!params?.id) throw new Error("Category ID is required");
      return apiRequest(`/api/categories/${params.id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories/with-counts"] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      navigate("/admin/categories");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete category: " + error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!params?.id) {
      toast({
        title: "Error",
        description: "Category ID is required",
        variant: "destructive",
      });
      return;
    }
    
    const categoryData: Category = {
      id: parseInt(params.id),
      name: data.name,
      slug: data.slug,
      icon: data.icon,
      color: data.color,
    };
    
    updateCategory.mutate(categoryData);
  };

  const handleDelete = () => {
    deleteCategory.mutate();
  };

  const iconOptions = [
    { value: "tag", label: "Tag" },
    { value: "shopping-cart", label: "Shopping Cart" },
    { value: "gift", label: "Gift" },
    { value: "percent", label: "Percent" },
    { value: "ticket", label: "Ticket" },
    { value: "tag-alt", label: "Tag Alt" },
    { value: "store", label: "Store" },
    { value: "tshirt", label: "T-Shirt" },
    { value: "laptop", label: "Laptop" },
    { value: "mobile", label: "Mobile" },
    { value: "utensils", label: "Utensils" },
    { value: "plane", label: "Plane" },
    { value: "car", label: "Car" },
    { value: "home", label: "Home" },
    { value: "gem", label: "Gem" },
  ];

  const colorOptions = [
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "red", label: "Red" },
    { value: "yellow", label: "Yellow" },
    { value: "purple", label: "Purple" },
    { value: "pink", label: "Pink" },
    { value: "indigo", label: "Indigo" },
    { value: "teal", label: "Teal" },
    { value: "orange", label: "Orange" },
    { value: "gray", label: "Gray" },
  ];

  // Function to get color class based on category color
  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-600";
      case "green":
        return "bg-green-100 text-green-600";
      case "purple":
        return "bg-purple-100 text-purple-600";
      case "red":
        return "bg-red-100 text-red-600";
      case "yellow":
        return "bg-yellow-100 text-yellow-600";
      case "pink":
        return "bg-pink-100 text-pink-600";
      case "indigo":
        return "bg-indigo-100 text-indigo-600";
      case "teal":
        return "bg-teal-100 text-teal-600";
      case "orange":
        return "bg-orange-100 text-orange-600";
      case "gray":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-neutral-200 text-neutral-600";
    }
  };

  if (isLoadingCategory) {
    return (
      <AdminLayout title="Edit Category">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="mb-4">Loading category data...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!category) {
    return (
      <AdminLayout title="Edit Category">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="mb-4">Category not found</div>
            <Button onClick={() => navigate("/admin/categories")}>
              Back to Categories
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Category">
      <div className="mb-6 flex justify-between items-center">
        <Button
          variant="ghost"
          className="pl-0 text-gray-600 hover:text-gray-900"
          onClick={() => navigate("/admin/categories")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Categories
        </Button>
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Delete Category
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the category
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Electronics" 
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
                    <FormItem className="mt-4">
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. electronics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <p className="text-sm text-gray-500 mb-4">Preview:</p>
                <div className={`inline-flex items-center justify-center w-16 h-16 ${getColorClasses(form.getValues("color"))} rounded-full mb-2`}>
                  <i className={`fas fa-${form.getValues("icon")} text-xl`}></i>
                </div>
                <h3 className="font-medium text-gray-800">{form.getValues("name") || "Category Name"}</h3>
                <p className="text-sm text-gray-500 mt-1">0 coupons</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {iconOptions.map((icon) => (
                          <SelectItem key={icon.value} value={icon.value}>
                            <div className="flex items-center">
                              <i className={`fas fa-${icon.value} mr-2`}></i>
                              {icon.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colorOptions.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center">
                              <div 
                                className={`w-4 h-4 rounded-full bg-${color.value}-500 mr-2`}
                              ></div>
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/admin/categories")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateCategory.isPending}
              >
                {updateCategory.isPending ? (
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

export default AdminCategoryEdit;