import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Mail, ArrowRight } from "lucide-react";

// Create a schema for newsletter subscription
const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

const Newsletter = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: NewsletterFormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Check if it's a duplicate email error
        const errorData = await response.json();
        
        if (errorData.error && errorData.error.includes("already subscribed")) {
          toast({
            title: "Already subscribed",
            description: "This email is already subscribed to our newsletter.",
            variant: "destructive",
          });
        } else {
          throw new Error("Failed to subscribe to newsletter");
        }
      } else {
        setIsSuccess(true);
        toast({
          title: "Subscription successful",
          description: "Thank you for subscribing to our newsletter!",
        });
        
        // Reset the form
        form.reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 5000);
      }
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "Failed to subscribe to newsletter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-blue-600 text-white py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-md">
            <div className="flex items-center mb-4">
              <Mail className="w-8 h-8 mr-3" />
              <h2 className="text-3xl font-bold">Stay updated</h2>
            </div>
            <p className="text-blue-100 mb-6">
              Subscribe to our newsletter to receive the latest deals, exclusive offers, 
              and savings tips directly to your inbox.
            </p>
          </div>

          <div className="flex-1 max-w-md">
            {isSuccess ? (
              <div className="bg-green-500 bg-opacity-20 border border-green-300 rounded-lg p-4 text-center">
                <p className="text-white font-semibold">
                  Thank you for subscribing!
                </p>
                <p className="text-blue-100 text-sm mt-2">
                  You'll now receive our latest deals and offers.
                </p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="Enter your email address"
                              className="bg-white text-gray-800 h-12 pl-4 pr-12 rounded-lg w-full"
                              disabled={isSubmitting}
                            />
                            <Button
                              type="submit"
                              size="sm"
                              className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-700 rounded-md p-1.5"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <Spinner size="sm" className="mr-0" />
                              ) : (
                                <ArrowRight className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-200" />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )}
            <p className="text-blue-200 text-xs mt-3">
              By subscribing you agree to receive offers from NepQue. We don't share your information.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;