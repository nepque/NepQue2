import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { UserSubmittedCouponWithRelations } from "@shared/schema";

// Form schema for the coupon edit
const editCouponSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  storeId: z.string().min(1, "Please select a store"),
  categoryId: z.string().min(1, "Please select a category"),
  expiresAt: z.date(),
  terms: z.string().nullable().optional(),
  reviewNotes: z.string().nullable().optional(),
});

type EditCouponValues = z.infer<typeof editCouponSchema>;

export default function AdminSubmissionEdit() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get the coupon submission data
  const { data: submission, isLoading, error } = useQuery({
    queryKey: ["/api/user-submitted-coupons", Number(id)],
    queryFn: () => apiRequest<UserSubmittedCouponWithRelations>(`/api/user-submitted-coupons/${id}`),
  });
  
  // Get stores and categories for dropdowns
  const { data: stores } = useQuery({
    queryKey: ["/api/stores"],
    queryFn: () => apiRequest("/api/stores"),
  });
  
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => apiRequest("/api/categories"),
  });
  
  // Update submission mutation
  const updateMutation = useMutation({
    mutationFn: (values: EditCouponValues) => 
      apiRequest(`/api/user-submitted-coupons/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          storeId: Number(values.storeId),
          categoryId: Number(values.categoryId),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-submitted-coupons"] });
      toast({
        title: "Success!",
        description: "Coupon submission updated successfully",
      });
      setLocation("/admin/submissions");
    },
    onError: (error) => {
      console.error("Failed to update coupon:", error);
      toast({
        title: "Error",
        description: "Failed to update the coupon submission",
        variant: "destructive",
      });
    },
  });
  
  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: () => 
      apiRequest(`/api/user-submitted-coupons/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "approved",
          reviewNotes: form.getValues().reviewNotes,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-submitted-coupons"] });
      toast({
        title: "Success!",
        description: "Coupon submission approved!",
      });
      setLocation("/admin/submissions");
    },
    onError: (error) => {
      console.error("Failed to approve coupon:", error);
      toast({
        title: "Error",
        description: "Failed to approve the coupon submission",
        variant: "destructive",
      });
    },
  });
  
  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: () => 
      apiRequest(`/api/user-submitted-coupons/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rejected",
          reviewNotes: form.getValues().reviewNotes,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-submitted-coupons"] });
      toast({
        title: "Rejected",
        description: "Coupon submission rejected",
      });
      setLocation("/admin/submissions");
    },
    onError: (error) => {
      console.error("Failed to reject coupon:", error);
      toast({
        title: "Error",
        description: "Failed to reject the coupon submission",
        variant: "destructive",
      });
    },
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => 
      apiRequest(`/api/user-submitted-coupons/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-submitted-coupons"] });
      toast({
        title: "Deleted",
        description: "Coupon submission permanently deleted",
      });
      setLocation("/admin/submissions");
    },
    onError: (error) => {
      console.error("Failed to delete coupon:", error);
      toast({
        title: "Error",
        description: "Failed to delete the coupon submission",
        variant: "destructive",
      });
    },
  });

  const form = useForm<EditCouponValues>({
    resolver: zodResolver(editCouponSchema),
    defaultValues: {
      title: "",
      description: "",
      code: "",
      storeId: "",
      categoryId: "",
      expiresAt: new Date(),
      terms: "",
      reviewNotes: "",
    },
  });
  
  // Update form when data is loaded
  useEffect(() => {
    if (submission) {
      form.reset({
        title: submission.title,
        description: submission.description,
        code: submission.code,
        storeId: submission.storeId.toString(),
        categoryId: submission.categoryId.toString(),
        expiresAt: new Date(submission.expiresAt),
        terms: submission.terms,
        reviewNotes: submission.reviewNotes,
      });
    }
  }, [submission, form]);
  
  const onSubmit = (values: EditCouponValues) => {
    updateMutation.mutate(values);
  };
  
  if (isLoading) {
    return (
      <AdminLayout title="Edit Submission">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }
  
  if (error || !submission) {
    return (
      <AdminLayout title="Edit Submission">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load the submission</CardDescription>
          </CardHeader>
          <CardContent>
            <p>We couldn't find the submission you're looking for.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setLocation("/admin/submissions")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Submissions
            </Button>
          </CardFooter>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Submission">
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation("/admin/submissions")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div>
              <CardTitle>Edit Coupon Submission</CardTitle>
              <CardDescription>
                Submitted by {submission.user?.name || "Unknown User"} on {format(new Date(submission.submittedAt), "PPP")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
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
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="storeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a store" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stores?.map(store => (
                            <SelectItem key={store.id} value={store.id.toString()}>
                              {store.name}
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
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map(category => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiration Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={
                              "w-full pl-3 text-left font-normal flex justify-between"
                            }
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
                        {...field} 
                        rows={2} 
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormDescription>
                      Any restrictions or terms for using the coupon
                    </FormDescription>
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
                        {...field} 
                        rows={2} 
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormDescription>
                      Notes about your decision (will be visible to the user)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/admin/submissions")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Updating..." : "Update"}
                  </Button>
                </div>
                
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                    onClick={() => approveMutation.mutate()}
                    disabled={approveMutation.isPending}
                  >
                    {approveMutation.isPending ? "Approving..." : "Approve"}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white"
                    onClick={() => rejectMutation.mutate()}
                    disabled={rejectMutation.isPending}
                  >
                    {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to permanently delete this submission? This action cannot be undone.")) {
                        deleteMutation.mutate();
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}