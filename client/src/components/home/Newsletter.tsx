import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate subscription process
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail("");
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
        variant: "default"
      });
    }, 1000);
  };

  return (
    <section className="py-12 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Never Miss a Deal</h2>
          <p className="text-white/80 mb-6">Subscribe to get personalized deals and updates delivered straight to your inbox</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row md:items-stretch max-w-md mx-auto">
            <div className="flex-grow mb-2 md:mb-0 md:mr-0">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="w-full px-4 py-3 rounded-md md:rounded-r-none shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 h-auto"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md md:rounded-l-none shadow-sm transition-colors h-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
          <p className="text-white/70 text-sm mt-4">By subscribing, you agree to our privacy policy and terms of service</p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
