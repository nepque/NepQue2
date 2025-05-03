
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { WithdrawalRequestWithUser } from "@shared/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export default function AdminWithdrawals() {
  const queryClient = useQueryClient();
  
  const { data: withdrawals = [], isLoading } = useQuery<WithdrawalRequestWithUser[]>({
    queryKey: ["/api/admin/withdrawals"],
    queryFn: () => apiRequest("/api/admin/withdrawals"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      return apiRequest(`/api/admin/withdrawals/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, notes }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      toast({
        title: "Success",
        description: "Withdrawal request status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update withdrawal request",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (id: number, status: "approved" | "rejected") => {
    updateStatusMutation.mutate({ id, status });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4">
          {withdrawals.map((withdrawal) => (
            <Card key={withdrawal.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {withdrawal.user.displayName || withdrawal.user.email}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Amount: {withdrawal.amount} points
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Method: {withdrawal.method}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Account: {withdrawal.accountDetails}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Requested: {format(new Date(withdrawal.requestedAt), "PPP")}
                    </p>
                    {withdrawal.processedAt && (
                      <p className="text-sm text-muted-foreground">
                        Processed: {format(new Date(withdrawal.processedAt), "PPP")}
                      </p>
                    )}
                    {withdrawal.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Notes: {withdrawal.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={
                      withdrawal.status === "approved" ? "default" :
                      withdrawal.status === "rejected" ? "destructive" :
                      "secondary"
                    }>
                      {withdrawal.status}
                    </Badge>
                    {withdrawal.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(withdrawal.id, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(withdrawal.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
