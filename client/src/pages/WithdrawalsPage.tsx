import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { WithdrawalRequestWithUser } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Helmet } from "react-helmet";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function WithdrawalsPage() {
  const { currentUser } = useAuth();

  // Get current user's data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: currentUser?.uid ? [`/api/users/${currentUser.uid}`] : ['no-user'],
    queryFn: async () => {
      if (!currentUser?.uid) return null;
      const response = await fetch(`/api/users/${currentUser.uid}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`);
      }
      return await response.json();
    },
    retry: 1,
    enabled: !!currentUser
  });

  // Fetch withdrawals for the current user
  const { data: withdrawals = [], isLoading, error, refetch } = useQuery<WithdrawalRequestWithUser[]>({
    queryKey: userData?.id ? [`/api/users/${userData.id}/withdrawals`] : ['no-withdrawals'],
    queryFn: async () => {
      try {
        if (!userData?.id) {
          console.log('No user ID available, cannot fetch withdrawals');
          return [];
        }
        
        console.log(`Fetching withdrawal data for user ID: ${userData.id}`);
        
        const response = await apiRequest(`/api/users/${userData.id}/withdrawals`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        console.log('Withdrawals response:', response);
        // Make sure we return an array even if response is null/undefined or not an array
        return Array.isArray(response) ? response : [];
      } catch (err) {
        console.error('Error fetching withdrawals:', err);
        throw err;
      }
    },
    enabled: !!userData?.id, // Only run when we have the user ID
    refetchOnWindowFocus: true,
    staleTime: 0, // Don't cache the data
  });

  useEffect(() => {
    if (error) {
      console.error('Withdrawal query error:', error);
    }
  }, [error]);

  // Handle refresh button click - refetch both user data and withdrawals
  const handleRefresh = () => {
    // If we have a valid user ID, refetch withdrawals 
    if (userData?.id) {
      refetch();
    }
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Withdrawal History | NepQue</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/profile" className="inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Withdrawal History</h1>
            <p className="text-gray-500 mt-1">Track all your point withdrawal requests</p>
          </div>

          {userLoading || isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Error loading withdrawal history</h3>
              <p className="text-gray-500 mb-4">
                There was a problem fetching your withdrawal requests
              </p>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : withdrawals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Account Details</TableHead>
                  <TableHead>Requested Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="font-medium">
                      {withdrawal.amount} points
                    </TableCell>
                    <TableCell className="capitalize">{withdrawal.method}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {withdrawal.accountDetails}
                    </TableCell>
                    <TableCell>
                      {format(new Date(withdrawal.requestedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        withdrawal.status === "approved" ? "default" :
                        withdrawal.status === "rejected" ? "destructive" :
                        "secondary"
                      }>
                        {withdrawal.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {withdrawal.processedAt 
                        ? format(new Date(withdrawal.processedAt), "MMM d, yyyy")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-1">No withdrawal history</h3>
              <p className="text-gray-500">
                You haven't made any withdrawal requests yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}