import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { 
  User, 
  UserCircle2, 
  ShieldAlert, 
  Edit, 
  Ban,
  CheckCircle,
  Search,
  CircleOff,
  CircleCheck
} from 'lucide-react';
import { getAuth, updateProfile } from 'firebase/auth';

// Mock function to simulate the real Firebase Admin SDK functionality
// In a real application, these operations would be done through server endpoints
// that use the Firebase Admin SDK
const mockGetUsers = async (): Promise<any[]> => {
  // In a real app, you would call a server endpoint that uses the Firebase Admin SDK
  // This is just a mock for demo purposes
  return [
    {
      uid: '1',
      email: 'user1@example.com',
      displayName: 'User One',
      photoURL: null,
      disabled: false,
      metadata: {
        creationTime: '2025-01-01T12:00:00Z',
        lastSignInTime: '2025-04-28T10:15:00Z'
      }
    },
    {
      uid: '2',
      email: 'user2@example.com',
      displayName: 'User Two',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
      disabled: false,
      metadata: {
        creationTime: '2025-01-15T09:30:00Z',
        lastSignInTime: '2025-04-30T14:20:00Z'
      }
    },
    {
      uid: '3',
      email: 'admin@couponhub.com',
      displayName: 'Admin User',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      disabled: false,
      metadata: {
        creationTime: '2025-01-01T10:00:00Z',
        lastSignInTime: '2025-05-01T08:05:00Z'
      }
    },
    {
      uid: '4',
      email: 'banned@example.com',
      displayName: 'Banned User',
      photoURL: null,
      disabled: true,
      metadata: {
        creationTime: '2025-02-10T11:45:00Z',
        lastSignInTime: '2025-03-15T16:30:00Z'
      }
    },
  ];
};

// Mock function to toggle user ban status
const mockToggleUserBan = async (uid: string, disabled: boolean): Promise<void> => {
  // In a real app, you would call a server endpoint that uses the Firebase Admin SDK
  console.log(`User ${uid} ban status changed to: ${disabled}`);
  return Promise.resolve();
};

// Mock function to update user profile
const mockUpdateUserProfile = async (
  uid: string, 
  updates: { displayName?: string; photoURL?: string; email?: string }
): Promise<void> => {
  // In a real app, you would call a server endpoint that uses the Firebase Admin SDK
  console.log(`User ${uid} profile updated:`, updates);
  return Promise.resolve();
};

// Interface for our user data with Firebase properties
interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  disabled: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
}

const AdminUsersPage = () => {
  const { isAdmin } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit user dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<FirebaseUser | null>(null);
  const [userForm, setUserForm] = useState({
    displayName: '',
    email: '',
    photoURL: ''
  });

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [isAdmin, navigate, toast]);

  // Load users on page load
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const fetchedUsers = await mockGetUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [toast]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle toggling user ban status
  const handleToggleBan = async (user: FirebaseUser) => {
    try {
      await mockToggleUserBan(user.uid, !user.disabled);
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.uid === user.uid ? {...u, disabled: !u.disabled} : u
      ));

      toast({
        title: "Success",
        description: `User ${user.disabled ? 'unbanned' : 'banned'} successfully.`,
      });
    } catch (error) {
      console.error('Error toggling user ban status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive"
      });
    }
  };

  // Handle opening edit user dialog
  const handleEditUser = (user: FirebaseUser) => {
    setSelectedUser(user);
    setUserForm({
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || ''
    });
    setEditDialogOpen(true);
  };

  // Handle saving user edits
  const handleSaveUserEdits = async () => {
    if (!selectedUser) return;

    try {
      await mockUpdateUserProfile(selectedUser.uid, userForm);
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.uid === selectedUser.uid ? {
          ...u, 
          displayName: userForm.displayName,
          email: userForm.email,
          photoURL: userForm.photoURL
        } : u
      ));

      setEditDialogOpen(false);
      
      toast({
        title: "Success",
        description: "User profile updated successfully.",
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast({
        title: "Error",
        description: "Failed to update user profile.",
        variant: "destructive"
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout title="Manage Users">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Export Users
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-32 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-32 text-center">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
              <p className="mt-2 text-gray-500">
                {searchTerm ? `No users match the search "${searchTerm}"` : 'No users have been registered yet.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow 
                    key={user.uid}
                    className={user.disabled ? "bg-gray-50 text-gray-400" : ""}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt={user.displayName || 'User avatar'} 
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <UserCircle2 className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{user.displayName || 'Unnamed User'}</div>
                          {user.email === 'admin@couponhub.com' && (
                            <span className="inline-flex items-center text-xs font-medium text-blue-600">
                              <ShieldAlert className="h-3 w-3 mr-1" />
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatDate(user.metadata.creationTime)}</TableCell>
                    <TableCell>{formatDate(user.metadata.lastSignInTime)}</TableCell>
                    <TableCell>
                      {user.disabled ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <CircleOff className="h-3 w-3 mr-1" />
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CircleCheck className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant={user.disabled ? "outline" : "ghost"} 
                        size="sm"
                        onClick={() => handleToggleBan(user)}
                        className={user.disabled ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700"}
                      >
                        {user.disabled ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Unban
                          </>
                        ) : (
                          <>
                            <Ban className="h-4 w-4 mr-1" />
                            Ban
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* User Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the user's profile information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={userForm.displayName}
                onChange={(e) => setUserForm({...userForm, displayName: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avatar" className="text-right">
                Avatar URL
              </Label>
              <Input
                id="avatar"
                value={userForm.photoURL}
                onChange={(e) => setUserForm({...userForm, photoURL: e.target.value})}
                className="col-span-3"
              />
            </div>
            {userForm.photoURL && (
              <div className="flex justify-center my-2">
                <img 
                  src={userForm.photoURL} 
                  alt="Avatar preview" 
                  className="h-20 w-20 rounded-full object-cover border"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveUserEdits}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsersPage;