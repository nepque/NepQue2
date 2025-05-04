import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

export interface PointsLogEntry {
  id: number;
  userId: number;
  points: number;
  action: string;
  description: string;
  createdAt: string;
}

export function usePointsLog() {
  const { user } = useAuth();
  
  const {
    data: pointsLog,
    isLoading: pointsLogLoading,
    error: pointsLogError,
    refetch: refetchPointsLog
  } = useQuery({
    queryKey: ["api", "points-log", user?.uid],
    queryFn: async () => {
      if (!user) return [];
      
      const response = await fetch(`/api/users/firebase/${user.uid}/points-log`);
      if (!response.ok) {
        throw new Error("Failed to fetch points log");
      }
      
      return response.json();
    },
    enabled: !!user,
  });
  
  const {
    data: pointsBalance,
    isLoading: balanceLoading,
    error: balanceError,
    refetch: refetchBalance
  } = useQuery({
    queryKey: ["api", "points-balance", user?.uid],
    queryFn: async () => {
      if (!user) return { balance: 0 };
      
      const response = await fetch(`/api/users/firebase/${user.uid}/points-balance`);
      if (!response.ok) {
        throw new Error("Failed to fetch points balance");
      }
      
      return response.json();
    },
    enabled: !!user,
  });
  
  const refreshPointsData = () => {
    refetchPointsLog();
    refetchBalance();
  };
  
  return {
    pointsLog: pointsLog || [],
    pointsLogLoading,
    pointsLogError,
    pointsBalance: pointsBalance?.balance || 0,
    balanceLoading,
    balanceError,
    refreshPointsData
  };
}