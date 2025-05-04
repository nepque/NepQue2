import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Download, Search, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

type Subscriber = {
  id: number;
  email: string;
  createdAt: string;
};

const AdminSubscribers = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all subscribers
  const { data: subscribers, isLoading } = useQuery({
    queryKey: ["/api/subscribers"],
    queryFn: async () => {
      const response = await fetch("/api/subscribers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch subscribers");
      }
      
      return response.json() as Promise<Subscriber[]>;
    },
  });

  // Filter subscribers based on search term
  const filteredSubscribers = subscribers?.filter(
    (subscriber) => subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle delete subscriber
  const handleDeleteSubscriber = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) {
      return;
    }

    try {
      const response = await fetch(`/api/subscribers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete subscriber");
      }

      toast({
        title: "Subscriber deleted",
        description: "The subscriber has been successfully deleted.",
      });

      // Invalidate subscribers query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/subscribers"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subscriber. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Export subscribers to CSV
  const exportToCSV = () => {
    if (!subscribers || subscribers.length === 0) {
      toast({
        title: "No subscribers",
        description: "There are no subscribers to export.",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = ["ID", "Email", "Subscription Date"];
    
    const csvContent = [
      headers.join(","),
      ...subscribers.map((subscriber) => [
        subscriber.id,
        subscriber.email,
        format(new Date(subscriber.createdAt), "yyyy-MM-dd HH:mm:ss"),
      ].join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `subscribers_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `${subscribers.length} subscribers exported to CSV.`,
    });
  };

  return (
    <AdminLayout title="Newsletter Subscribers">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search subscribers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Button onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export to CSV
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subscription Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers && filteredSubscribers.length > 0 ? (
                  filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.id}</TableCell>
                      <TableCell>{subscriber.email}</TableCell>
                      <TableCell>
                        {format(new Date(subscriber.createdAt), "PPP")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteSubscriber(subscriber.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                      {searchTerm
                        ? "No subscribers match your search."
                        : "No subscribers found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          {filteredSubscribers && (
            <p>
              Showing {filteredSubscribers.length} of {subscribers?.length}{" "}
              subscribers
            </p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSubscribers;