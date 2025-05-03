import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { User } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Pencil, Trash2, Ban, UserCheck, Search, UserX } from "lucide-react";
import { generatePlaceholderImage } from "@/lib/utils";

interface UserWithSubmissionCount extends User {
  submissionCount: number;
}

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<UserWithSubmissionCount | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithSubmissionCount | null>(null);

  // Fetch users with their submission counts
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      try {
        // Add cache-busting parameter to avoid browser cache
        const timestamp = new Date().getTime();
        const response = await apiRequest(`/api/admin/users?_=${timestamp}`);
        console.log('API Response:', response); // Debug the response
        
        // Check if we actually got a response
        if (!response) {
          console.error('No response from API');
          return [];
        }
        
        // Handle different response types
        if (Array.isArray(response)) {
          // Response is already an array
          return response.map(user => ({
            ...user,
            submissionCount: user.submissionCount || 0
          }));
        } else if (typeof response === 'object') {
          // Try to extract users from response object if it's not an array
          const possibleUsers = Object.values(response);
          if (possibleUsers.length > 0) {
            return possibleUsers.map((user: any) => ({
              ...user,
              submissionCount: user.submissionCount || 0
            }));
          }
        }
        
        // Default case, return empty array
        console.log('Returning empty array, response format not recognized');
        return [];
      } catch (e) {
        console.error('Error fetching users:', e);
        return [];
      }
    },
    // Disable caching to always get fresh data
    staleTime: 0,
    refetchInterval: 10000, // Automatically refresh every 10 seconds
  });

  // Ban/unban user mutation
  const banUserMutation = useMutation({
    mutationFn: async ({ userId, isBanned }: { userId: number, isBanned: boolean }) => {
      console.log('Ban mutation with params:', { userId, isBanned });
      return apiRequest(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ isBanned })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User status updated successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
      console.error("Error updating user status:", error);
    }
  });

  // Update user details mutation
  const updateUserMutation = useMutation({
    mutationFn: async (updatedUser: Partial<User> & { id: number }) => {
      console.log('Sending update to server:', JSON.stringify(updatedUser));
      
      // No loading toast - using the mutation state for UI feedback
      return await apiRequest(`/api/admin/users/${updatedUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedUser),
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
    },
    onSuccess: (data) => {
      console.log('Update successful, received data:', data);
      
      // Force a hard refresh of the users data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "User details updated successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user details. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating user:", error);
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      toast({
        title: "Success",
        description: "User deleted successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
      console.error("Error deleting user:", error);
    }
  });

  const handleBanUser = (user: UserWithSubmissionCount) => {
    // Make sure isBanned is a boolean (not undefined)
    const currentIsBanned = Boolean(user.isBanned);
    const newBanStatus = !currentIsBanned;
    
    console.log(`Attempting to change ban status from ${currentIsBanned} to ${newBanStatus}`);
    console.log('User object:', user);
    
    // Use mutation UI states instead of toast for loading indicators
    banUserMutation.mutate({
      userId: user.id,
      isBanned: newBanStatus
    });
  };

  const handleEditUser = (user: UserWithSubmissionCount) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    // Log what we're sending to the server
    console.log('Updating user with data:', {
      id: editingUser.id,
      displayName: editingUser.displayName || '',
      email: editingUser.email || '',
      photoURL: editingUser.photoURL || '',
    });

    updateUserMutation.mutate({
      id: editingUser.id,
      displayName: editingUser.displayName || '',
      email: editingUser.email || '',
      photoURL: editingUser.photoURL || '',
    });
  };

  const confirmDeleteUser = (user: UserWithSubmissionCount) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  const filteredUsers = users?.filter(user => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (user.displayName?.toLowerCase().includes(searchTermLower) || false) ||
      (user.email?.toLowerCase().includes(searchTermLower) || false)
    );
  });

  return (
    <AdminLayout title="Manage Users">
      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className="text-sm">
            {filteredUsers ? `${filteredUsers.length} users` : "Loading..."}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage all registered users and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">
              Failed to load users. Please try again.
            </div>
          ) : !filteredUsers?.length ? (
            <div className="text-center text-gray-500 py-8">
              {searchTerm ? "No users match your search." : "No users found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Submissions</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                            <AvatarFallback>{generateInitials(user.displayName || "User")}</AvatarFallback>
                          </Avatar>
                          <span>{user.displayName || "Unnamed User"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{user.submissionCount}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {user.isBanned ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <UserX className="h-3 w-3" /> Banned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                            <UserCheck className="h-3 w-3" /> Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(user)}
                            title="Edit user"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={user.isBanned ? "outline" : "ghost"}
                            size="icon"
                            onClick={() => handleBanUser(user)}
                            title={user.isBanned ? "Unban user" : "Ban user"}
                            className={user.isBanned ? "text-green-600 hover:text-green-700" : "text-amber-600 hover:text-amber-700"}
                          >
                            {user.isBanned ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDeleteUser(user)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and profile information.
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <form onSubmit={handleUpdateUser}>
              <div className="grid gap-4 py-4">
                <div className="flex justify-center mb-2">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={editingUser.photoURL || undefined} alt={editingUser.displayName || "User"} />
                    <AvatarFallback>{generateInitials(editingUser.displayName || "User")}</AvatarFallback>
                  </Avatar>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="displayName" className="text-right">Name</label>
                  <Input
                    id="displayName"
                    value={editingUser.displayName || ""}
                    onChange={(e) => setEditingUser({...editingUser, displayName: e.target.value})}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="email" className="text-right">Email</label>
                  <Input
                    id="email"
                    value={editingUser.email || ""}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="photoURL" className="text-right">Avatar URL</label>
                  <Input
                    id="photoURL"
                    value={editingUser.photoURL || ""}
                    onChange={(e) => setEditingUser({...editingUser, photoURL: e.target.value})}
                    placeholder="https://example.com/avatar.jpg"
                    className="col-span-3"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone, and all associated data will be permanently removed.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {userToDelete && (
              <div className="flex items-center p-4 border rounded-md bg-red-50 border-red-200">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={userToDelete.photoURL || undefined} alt={userToDelete.displayName || "User"} />
                  <AvatarFallback>{generateInitials(userToDelete.displayName || "User")}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{userToDelete.displayName || "Unnamed User"}</div>
                  <div className="text-sm text-gray-500">{userToDelete.email}</div>
                  <div className="text-sm text-gray-500">Submissions: {userToDelete.submissionCount}</div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

// Helper function to generate initials for avatar fallback
const generateInitials = (name: string): string => {
  if (!name) return "?";
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

export default AdminUsers;