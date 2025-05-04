import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { PlusCircle, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { apiRequest } from '../../lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Helmet } from 'react-helmet';

/**
 * Admin interface for managing banner ads
 */
const AdminBannerAds: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<BannerAdType | null>(null);
  const [formData, setFormData] = useState<Partial<BannerAdType>>({
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
    queryFn: () => apiRequest<BannerAdType[]>('/api/admin/banner-ads'),
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
      description: banner.description,
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
    <div className="container mx-auto p-4">
      <Helmet>
        <title>Banner Ads Management | NepQue Admin</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Banner Ads Management</h1>
        <Button onClick={() => { resetForm(); setIsOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> 
          Add New Banner
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : bannerAds && bannerAds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bannerAds.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{banner.title}</CardTitle>
                  <div className="flex space-x-2">
                    <Badge 
                      variant={banner.isActive ? "default" : "outline"}
                      className="ml-2"
                    >
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Location: {banner.location}</div>
                  <p className="text-sm">{banner.description}</p>
                </div>
                
                {/* Banner preview */}
                <div className="relative w-full h-[90px] rounded overflow-hidden mb-4">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500"
                    style={{ 
                      backgroundImage: banner.imageUrl ? `url(${banner.imageUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col justify-center p-4 text-white">
                    <h3 className="text-lg font-bold">{banner.title}</h3>
                    <p className="text-sm">{banner.description}</p>
                  </div>
                  <div className="absolute top-1 right-1 bg-black/40 text-white text-xs px-1 rounded">
                    Ad
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    size="sm" 
                    variant={banner.isActive ? "outline" : "default"} 
                    onClick={() => handleToggleStatus(banner)}
                  >
                    {banner.isActive ? (
                      <><XCircle className="h-4 w-4 mr-1" /> Deactivate</>
                    ) : (
                      <><CheckCircle className="h-4 w-4 mr-1" /> Activate</>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleEdit(banner)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleDelete(banner)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No banner ads found</p>
          <Button onClick={() => { resetForm(); setIsOpen(true); }}>
            Create Your First Banner Ad
          </Button>
        </div>
      )}
      
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
                value={formData.description}
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
                value={formData.imageUrl}
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
                value={formData.linkUrl}
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
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
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
    </div>
  );
};

export default AdminBannerAds;