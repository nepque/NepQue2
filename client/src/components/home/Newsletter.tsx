import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Form validation schema
const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

const Newsletter = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  });

  // Create subscriber mutation
  const subscribeMutation = useMutation({
    mutationFn: async (data: NewsletterFormValues) => {
      return await apiRequest("/api/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter",
      });
      form.reset();
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      // Check if the error is because email is already subscribed
      if (error.status === 400 && error.message === "Email is already subscribed") {
        toast({
          title: "Already subscribed",
          description: "This email is already subscribed to our newsletter",
        });
      } else {
        toast({
          title: "Subscription failed",
          description: "There was an error subscribing to the newsletter. Please try again.",
          variant: "destructive",
        });
      }
      setIsSubmitting(false);
    },
  });

  // Handle form submission
  const onSubmit = (data: NewsletterFormValues) => {
    setIsSubmitting(true);
    subscribeMutation.mutate(data);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-12 px-6 rounded-xl shadow-md">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Subscribe to Our Newsletter</h2>
        <p className="text-blue-100 mb-6">
          Get the latest deals and coupons delivered directly to your inbox
        </p>
        
        <form 
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <div className="flex-1">
            <Input
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              className="h-11 bg-white/90 border-0"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-white mt-1 text-left">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <Button 
            type="submit"
            className="h-11 px-6 bg-white text-blue-700 hover:bg-blue-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Newsletter;