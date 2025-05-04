import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentUser, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!loading && !currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please login to access this page",
        variant: "destructive",
      });
      setLocation('/');
    }
  }, [currentUser, loading, setLocation, toast]);

  // If loading, show nothing (we're waiting to check auth state)
  if (loading) {
    return null;
  }

  // Only render children if user is authenticated
  return currentUser ? <>{children}</> : null;
};

export default ProtectedRoute;