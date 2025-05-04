import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Trash2, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Subscriber } from "@shared/schema";
import AdminLayout from "@/components/admin/AdminLayout";
import { Spinner } from "@/components/ui/spinner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const AdminSubscribers = () => {
  const queryClient = useQueryClient();
  const [subscriberToDelete, setSubscriberToDelete] = useState<number | null>(null);

  // Fetch subscribers
  const { data: subscribers, isLoading } = useQuery<Subscriber[]>({
    queryKey: ["/api/admin/subscribers"],
    enabled: true,
  });

  // Update subscriber subscription status
  const updateSubscriberMutation = useMutation({
    mutationFn: async ({ id, subscribed }: { id: number; subscribed: boolean }) => {
      return await apiRequest(`/api/admin/subscribers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscribed }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscribers"] });
      toast({
        title: "Success",
        description: "Subscriber status updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating subscriber:", error);
      toast({
        title: "Error",
        description: "Failed to update subscriber status",
        variant: "destructive",
      });
    },
  });

  // Delete subscriber
  const deleteSubscriberMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/subscribers/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscribers"] });
      toast({
        title: "Success",
        description: "Subscriber deleted successfully",
      });
      setSubscriberToDelete(null);
    },
    onError: (error) => {
      console.error("Error deleting subscriber:", error);
      toast({
        title: "Error",
        description: "Failed to delete subscriber",
        variant: "destructive",
      });
      setSubscriberToDelete(null);
    },
  });

  // Handle subscription status change
  const handleSubscriptionChange = (id: number, currentStatus: boolean) => {
    updateSubscriberMutation.mutate({
      id,
      subscribed: !currentStatus,
    });
  };

  // Handle delete confirmation
  const handleConfirmDelete = () => {
    if (subscriberToDelete) {
      deleteSubscriberMutation.mutate(subscriberToDelete);
    }
  };

  // Handle CSV export
  const handleExportCsv = () => {
    // Create a link to download the CSV and click it
    const link = document.createElement("a");
    link.href = "/api/admin/subscribers/export";
    link.setAttribute("download", "subscribers.csv");
    link.setAttribute("target", "_blank");
    
    // Add authorization header via fetch
    fetch("/api/admin/subscribers/export", {
      headers: {
        "Authorization": "Bearer admin-development-token",
      },
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Success",
          description: "Subscribers exported successfully",
        });
      })
      .catch(error => {
        console.error("Error exporting subscribers:", error);
        toast({
          title: "Error",
          description: "Failed to export subscribers",
          variant: "destructive",
        });
      });
  };

  return (
    <AdminLayout>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Newsletter Subscribers</CardTitle>
            <CardDescription>
              Manage newsletter subscribers and export subscriber data
            </CardDescription>
          </div>
          <Button
            onClick={handleExportCsv}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Spinner />
            </div>
          ) : subscribers && subscribers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell>{subscriber.id}</TableCell>
                      <TableCell>{subscriber.email}</TableCell>
                      <TableCell>
                        <Switch
                          checked={subscriber.subscribed}
                          onCheckedChange={() => handleSubscriptionChange(subscriber.id, subscriber.subscribed)}
                        />
                      </TableCell>
                      <TableCell>
                        {subscriber.createdAt
                          ? format(new Date(subscriber.createdAt), "MMM d, yyyy h:mm a")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {subscriber.updatedAt
                          ? format(new Date(subscriber.updatedAt), "MMM d, yyyy h:mm a")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => setSubscriberToDelete(subscriber.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the subscriber from the database.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={() => setSubscriberToDelete(null)}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleConfirmDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              No subscribers found
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminSubscribers;