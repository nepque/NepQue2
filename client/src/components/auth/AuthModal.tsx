import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FaGoogle } from "react-icons/fa";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleClose = () => {
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Success",
        description: "You have successfully signed in with Google.",
      });
      handleClose();
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast({
        title: "Error",
        description: "Failed to sign in with Google.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Welcome to NepQue
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign in or create an account to access exclusive deals
          </DialogDescription>
        </DialogHeader>

        <Button
          type="button"
          variant="outline"
          className="mt-8 w-full py-6 text-base"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <FaGoogle className="mr-2 h-5 w-5" />
          Google
        </Button>
      </DialogContent>
    </Dialog>
  );
};