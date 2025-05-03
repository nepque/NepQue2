import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertStoreSchema, type InsertStore } from "@shared/schema";

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
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertStoreSchema.extend({
  // Add any additional validation for the form
});

type FormValues = z.infer<typeof formSchema>;

const AdminStoreNew = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Form definition
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
      website: "https://",
    },
  });

  // Create store mutation
  const createStore = useMutation({
    mutationFn: async (store: InsertStore) => {
      return apiRequest("/api/stores", {
        method: "POST",
        body: JSON.stringify(store),
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
        description: "Store created successfully",
      });
      navigate("/admin/stores");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create store: " + error.message,
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
    createStore.mutate(data);
  };

  return (
    <AdminLayout title="Add New Store">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="pl-0 text-gray-600 hover:text-gray-900"
          onClick={() => navigate("/admin/stores")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Stores
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
                        // Optionally set a default logo URL if none provided
                        if (!e.target.value && form.getValues("website").startsWith("https://")) {
                          const domain = form.getValues("website").replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
                          if (domain) {
                            form.setValue("logo", `https://logo.clearbit.com/${domain}`);
                          }
                        }
                      }}
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
                disabled={createStore.isPending}
              >
                {createStore.isPending ? (
                  "Creating..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Store
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

export default AdminStoreNew;