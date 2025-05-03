import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertCategorySchema, type InsertCategory } from "@shared/schema";

import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertCategorySchema.extend({
  // Add any additional validation for the form
});

type FormValues = z.infer<typeof formSchema>;

const AdminCategoryNew = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
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

  // Create category mutation
  const createCategory = useMutation({
    mutationFn: async (category: InsertCategory) => {
      return apiRequest("/api/categories", {
        method: "POST",
        body: JSON.stringify(category),
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
        description: "Category created successfully",
      });
      navigate("/admin/categories");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create category: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const onSubmit = (data: FormValues) => {
    createCategory.mutate(data);
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

  return (
    <AdminLayout title="Add New Category">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="pl-0 text-gray-600 hover:text-gray-900"
          onClick={() => navigate("/admin/categories")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Categories
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. electronics" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                      defaultValue={field.value}
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
                disabled={createCategory.isPending}
              >
                {createCategory.isPending ? (
                  "Creating..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Category
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

export default AdminCategoryNew;