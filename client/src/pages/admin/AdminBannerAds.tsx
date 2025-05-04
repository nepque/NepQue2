import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, CheckCircle, XCircle, MoreHorizontal, Search, ExternalLink, Image } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BannerAd as BannerAdType } from '@shared/schema';
import AdminLayout from '@/components/admin/AdminLayout';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Admin interface for managing banner ads
 */
const AdminBannerAds = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<BannerAdType | null>(null);
  const [formData, setFormData] = useState<Partial<BannerAdType> & { isActive?: boolean }>({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    location: 'spin-page',
    isActive: true,
  });

  // Fetch all banner ads
  const { data: bannerAds, isLoading } = useQuery({
    queryKey: ['/api/admin/banner-ads'],
    queryFn: () => apiRequest('/api/admin/banner-ads'),
  });

  // Create a new banner ad
  const createMutation = useMutation({
    mutationFn: (banner: Partial<BannerAdType>) => 
      apiRequest('/api/admin/banner-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banner),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/banner-ads'] });
      toast({
        title: 'Success',
        description: 'Banner ad created successfully',
      });
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create banner ad',
        variant: 'destructive',
      });
      console.error('Create banner error:', error);
    },
  });

  // Update existing banner ad
  const updateMutation = useMutation({
    mutationFn: (banner: BannerAdType) => 
      apiRequest(`/api/admin/banner-ads/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banner),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/banner-ads'] });
      toast({
        title: 'Success',
        description: 'Banner ad updated successfully',
      });
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update banner ad',
        variant: 'destructive',
      });
      console.error('Update banner error:', error);
    },
  });

  // Toggle banner active status
  const toggleMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/admin/banner-ads/${id}/toggle`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/banner-ads'] });
      toast({
        title: 'Success',
        description: 'Banner status updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update banner status',
        variant: 'destructive',
      });
      console.error('Toggle banner error:', error);
    },
  });

  // Delete banner ad
  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/admin/banner-ads/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/banner-ads'] });
      toast({
        title: 'Success',
        description: 'Banner ad deleted successfully',
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete banner ad',
        variant: 'destructive',
      });
      console.error('Delete banner error:', error);
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      location: 'spin-page',
      isActive: true,
    });
    setCurrentBanner(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox separately
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentBanner) {
      // Update existing banner
      updateMutation.mutate({ ...currentBanner, ...formData } as BannerAdType);
    } else {
      // Create new banner
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (banner: BannerAdType) => {
    setCurrentBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      imageUrl: banner.imageUrl || '',
      linkUrl: banner.linkUrl || '',
      location: banner.location,
      isActive: banner.isActive,
    });
    setIsOpen(true);
  };

  const handleDelete = (banner: BannerAdType) => {
    setCurrentBanner(banner);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentBanner) {
      deleteMutation.mutate(currentBanner.id);
    }
  };

  const handleToggleStatus = (banner: BannerAdType) => {
    toggleMutation.mutate(banner.id);
  };

  return (
    <AdminLayout title="Banner Ads">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search banners..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-[280px]"
          />
        </div>
        
        <Button onClick={() => { resetForm(); setIsOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> 
          Add Banner
        </Button>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        ) : bannerAds && bannerAds.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Banner</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bannerAds.map((banner: BannerAdType) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{banner.title}</span>
                        {banner.description && (
                          <span className="text-sm text-gray-500 truncate max-w-[250px]">
                            {banner.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {banner.location}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={banner.isActive ? "default" : "outline"}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="relative w-[120px] h-[30px] rounded overflow-hidden">
                        {banner.imageUrl ? (
                          <img 
                            src={banner.imageUrl} 
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white text-xs">
                            {banner.title}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(banner)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(banner)}>
                            {banner.isActive ? (
                              <>
                                <XCircle className="h-4 w-4 mr-2" /> 
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" /> 
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 cursor-pointer"
                            onClick={() => handleDelete(banner)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        ) : (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Image className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No banner ads found</h3>
            <p className="text-gray-500 mb-4">
              Get started by adding your first banner ad
            </p>
            <Button onClick={() => { resetForm(); setIsOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          </div>
        )}
      </div>
      
      {/* Create/Edit Banner Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentBanner ? 'Edit Banner Ad' : 'Create New Banner Ad'}</DialogTitle>
            <DialogDescription>
              {currentBanner 
                ? 'Update the details for this banner ad' 
                : 'Enter the details to create a new banner ad. Banner size should be 700x90 px.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter banner title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={2}
                placeholder="Brief description for the banner"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl || ''}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500">Recommended size: 700x90 pixels</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="linkUrl">Link URL</Label>
              <Input
                id="linkUrl"
                name="linkUrl"
                value={formData.linkUrl || ''}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="spin-page">Spin Page</option>
                <option value="homepage">Homepage</option>
                <option value="earn-page">Earn Page</option>
                <option value="profile-page">Profile Page</option>
                <option value="coupon-popup">Coupon Popup</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive === undefined || formData.isActive === null ? true : formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></span>
                    Saving...
                  </span>
                ) : currentBanner ? 'Update Banner' : 'Create Banner'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this banner ad? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></span>
                  Deleting...
                </span>
              ) : 'Delete Banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminBannerAds;