import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export interface PointsLogEntry {
  id: number;
  userId: number;
  points: number;
  action: string;
  description: string;
  createdAt: string;
}

export function usePointsLog() {
  const { currentUser } = useAuth();
  
  // Create a stable key for the queries
  const userKey = currentUser?.uid || 'no-user';
  
  // Fetch the points log
  const { data: pointsLog = [], isLoading: pointsLogLoading, error: pointsLogError } = useQuery({
    queryKey: ['/api/users/firebase', userKey, 'points-log'],
    queryFn: async () => {
      if (!currentUser?.uid) return [];
      
      try {
        const response = await fetch(`/api/users/firebase/${currentUser.uid}/points-log`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch points log: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error fetching points log:", error);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: !!currentUser?.uid, // Only run the query if we have a user
  });
  
  // Fetch the points balance
  const { data: balanceData, isLoading: balanceLoading, error: balanceError } = useQuery({
    queryKey: ['/api/users/firebase', userKey, 'points-balance'],
    queryFn: async () => {
      if (!currentUser?.uid) return { balance: 0 };
      
      try {
        const response = await fetch(`/api/users/firebase/${currentUser.uid}/points-balance`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch points balance: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error fetching points balance:", error);
        return { balance: 0 };
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: !!currentUser?.uid, // Only run the query if we have a user
  });
  
  // Sort points log entries by createdAt in descending order (newest first)
  // Only sort if there are entries to sort
  const sortedPointsLog = Array.isArray(pointsLog) && pointsLog.length > 0 
    ? [...pointsLog].sort((a, b) => {
        return new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime();
      })
    : [];
  
  return {
    pointsLog: sortedPointsLog as PointsLogEntry[],
    pointsLogLoading,
    pointsLogError,
    pointsBalance: balanceData?.balance || 0,
    balanceLoading,
    balanceError,
  };
}