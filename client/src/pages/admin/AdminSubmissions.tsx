import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { UserSubmittedCouponWithRelations } from "@shared/schema";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ArrowUpRight, CheckCircle, Clock, Edit, Loader2, Pencil, ThumbsDown, ThumbsUp, Trash, XCircle } from "lucide-react";

export default function AdminSubmissions() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedCoupon, setSelectedCoupon] = useState<UserSubmittedCouponWithRelations | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Fetch user-submitted coupons based on the selected status tab
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['/api/user-submitted-coupons', { status: selectedTab }],
    queryFn: async () => {
      try {
        console.log(`Fetching submissions with status: ${selectedTab}`);
        const response = await fetch(`/api/user-submitted-coupons?status=${selectedTab}&sortBy=newest`);
        if (!response.ok) {
          throw new Error(`Failed to fetch user-submitted coupons: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched user-submitted coupons:", data);
        return data;
      } catch (error) {
        console.error("Error fetching user-submitted coupons:", error);
        return [];
      }
    }
  });
  
  // Ensure coupons is always an array
  const couponsArray = Array.isArray(coupons) ? coupons : [];
  
  // Handle approving a coupon
  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log(`Approving coupon with id ${id}, notes: ${reviewNotes}`);
      const response = await fetch(`/api/user-submitted-coupons/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', reviewNotes })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error approving coupon: ${response.status} - ${errorText}`);
        throw new Error(`Failed to approve coupon: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-submitted-coupons'] });
      toast({
        title: "Coupon approved",
        description: "The coupon has been approved and added to the site."
      });
      setShowApproveDialog(false);
      setReviewNotes("");
      setSelectedCoupon(null);
    },
    onError: (error) => {
      console.error("Error in approve mutation:", error);
      toast({
        title: "Failed to approve coupon",
        description: "An error occurred while approving the coupon.",
        variant: "destructive"
      });
    }
  });
  
  // Handle rejecting a coupon
  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log(`Rejecting coupon with id ${id}, notes: ${reviewNotes}`);
      const response = await fetch(`/api/user-submitted-coupons/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', reviewNotes })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error rejecting coupon: ${response.status} - ${errorText}`);
        throw new Error(`Failed to reject coupon: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-submitted-coupons'] });
      toast({
        title: "Coupon rejected",
        description: "The coupon has been rejected."
      });
      setShowRejectDialog(false);
      setReviewNotes("");
      setSelectedCoupon(null);
    },
    onError: (error) => {
      console.error("Error in reject mutation:", error);
      toast({
        title: "Failed to reject coupon",
        description: "An error occurred while rejecting the coupon.",
        variant: "destructive"
      });
    }
  });
  
  const handleApprove = (coupon: UserSubmittedCouponWithRelations) => {
    setSelectedCoupon(coupon);
    setReviewNotes("");
    setShowApproveDialog(true);
  };
  
  const handleReject = (coupon: UserSubmittedCouponWithRelations) => {
    setSelectedCoupon(coupon);
    setReviewNotes("");
    setShowRejectDialog(true);
  };
  
  const confirmApprove = () => {
    if (selectedCoupon) {
      approveMutation.mutate(selectedCoupon.id);
    }
  };
  
  const confirmReject = () => {
    if (selectedCoupon) {
      rejectMutation.mutate(selectedCoupon.id);
    }
  };
  
  // Handle editing a coupon
  const handleEdit = (coupon: UserSubmittedCouponWithRelations) => {
    // Navigate to the user submission edit page with the coupon ID
    navigate(`/admin/submissions/edit/${coupon.id}`);
  };
  
  // Handle deleting a coupon
  const handleDelete = (coupon: UserSubmittedCouponWithRelations) => {
    setSelectedCoupon(coupon);
    setShowDeleteDialog(true);
  };
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log(`Deleting coupon with id ${id}`);
      const response = await fetch(`/api/user-submitted-coupons/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error deleting coupon: ${response.status} - ${errorText}`);
        throw new Error(`Failed to delete coupon: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-submitted-coupons'] });
      toast({
        title: "Coupon deleted",
        description: "The coupon has been permanently deleted."
      });
      setShowDeleteDialog(false);
      setSelectedCoupon(null);
    },
    onError: (error) => {
      console.error("Error in delete mutation:", error);
      toast({
        title: "Failed to delete coupon",
        description: "An error occurred while deleting the coupon.",
        variant: "destructive"
      });
    }
  });
  
  const confirmDelete = () => {
    if (selectedCoupon) {
      deleteMutation.mutate(selectedCoupon.id);
    }
  };
  
  return (
    <AdminLayout title="Coupon Submissions">
      <Card>
        <CardHeader>
          <CardTitle>User Submitted Coupons</CardTitle>
          <CardDescription>
            Review and manage coupons submitted by users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)} className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="pending" className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> Pending
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Approved
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Rejected
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : couponsArray.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending submissions found
                </div>
              ) : (
                <div className="space-y-4">
                  {couponsArray.map(coupon => (
                    <SubmissionCard 
                      key={coupon.id} 
                      coupon={coupon} 
                      onApprove={() => handleApprove(coupon)}
                      onReject={() => handleReject(coupon)}
                      onEdit={() => handleEdit(coupon)}
                      onDelete={() => handleDelete(coupon)}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="approved" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : couponsArray.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No approved submissions found
                </div>
              ) : (
                <div className="space-y-4">
                  {couponsArray.map(coupon => (
                    <SubmissionCard 
                      key={coupon.id} 
                      coupon={coupon}
                      onEdit={() => handleEdit(coupon)}
                      onDelete={() => handleDelete(coupon)}
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="rejected" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : couponsArray.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No rejected submissions found
                </div>
              ) : (
                <div className="space-y-4">
                  {couponsArray.map(coupon => (
                    <SubmissionCard 
                      key={coupon.id} 
                      coupon={coupon}
                      onEdit={() => handleEdit(coupon)}
                      onDelete={() => handleDelete(coupon)}
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Coupon</DialogTitle>
            <DialogDescription>
              This will approve the coupon and make it visible on the site.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">{selectedCoupon?.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedCoupon?.description}</p>
              <div className="flex items-center text-sm gap-2">
                {selectedCoupon?.store ? (
                  <>
                    <img 
                      src={selectedCoupon.store.logo || ''} 
                      alt={selectedCoupon.store.name || 'Store'}
                      className="w-4 h-4 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCoupon.store.name || 'Store')}&background=random&size=16`;
                      }}
                    />
                    <span>{selectedCoupon.store.name || 'Unknown Store'}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Store information not available</span>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="approve-notes" className="block text-sm font-medium mb-1">
                Review Notes (optional)
              </label>
              <Textarea 
                id="approve-notes"
                placeholder="Add any notes for the submitter (optional)"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                These notes will be visible to the user who submitted the coupon
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmApprove}
              disabled={approveMutation.isPending}
              className="gap-1"
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> 
                  Approving...
                </>
              ) : (
                <>
                  <ThumbsUp className="h-4 w-4" /> 
                  Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Coupon</DialogTitle>
            <DialogDescription>
              This will reject the coupon and it will not be added to the site.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">{selectedCoupon?.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedCoupon?.description}</p>
              <div className="flex items-center text-sm gap-2">
                {selectedCoupon?.store ? (
                  <>
                    <img 
                      src={selectedCoupon.store.logo || ''} 
                      alt={selectedCoupon.store.name || 'Store'}
                      className="w-4 h-4 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCoupon.store.name || 'Store')}&background=random&size=16`;
                      }}
                    />
                    <span>{selectedCoupon.store.name || 'Unknown Store'}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Store information not available</span>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="reject-notes" className="block text-sm font-medium mb-1">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <Textarea 
                id="reject-notes"
                placeholder="Please provide a reason for rejection"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                These notes will be visible to the user who submitted the coupon
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmReject}
              disabled={rejectMutation.isPending || !reviewNotes.trim()}
              className="gap-1"
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> 
                  Rejecting...
                </>
              ) : (
                <>
                  <ThumbsDown className="h-4 w-4" /> 
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              This will permanently delete the coupon from the system. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">{selectedCoupon?.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedCoupon?.description}</p>
              
              <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md">
                <p className="text-sm font-medium">Warning:</p>
                <p className="text-sm">Deleting this coupon will remove it permanently and all associated data will be lost.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="gap-1"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> 
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4" /> 
                  Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// Submission card component
interface SubmissionCardProps {
  coupon: UserSubmittedCouponWithRelations;
  onApprove?: () => void;
  onReject?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const SubmissionCard = ({ coupon, onApprove, onReject, onEdit, onDelete, showActions = false }: SubmissionCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">{coupon.title}</h3>
            <p className="text-muted-foreground">{coupon.description}</p>
          </div>
          <div>
            {coupon.status === 'pending' && (
              <Badge variant="outline" className="bg-yellow-50">
                <Clock className="w-3 h-3 mr-1 text-yellow-500" /> Pending
              </Badge>
            )}
            {coupon.status === 'approved' && (
              <Badge variant="outline" className="bg-green-50">
                <CheckCircle className="w-3 h-3 mr-1 text-green-500" /> Approved
              </Badge>
            )}
            {coupon.status === 'rejected' && (
              <Badge variant="outline" className="bg-red-50">
                <XCircle className="w-3 h-3 mr-1 text-red-500" /> Rejected
              </Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Store</h4>
            <div className="flex items-center">
              {coupon.store ? (
                <>
                  <img 
                    src={coupon.store.logo || ''} 
                    alt={coupon.store.name || 'Store'}
                    className="w-4 h-4 mr-2 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(coupon.store.name || 'Store')}&background=random&size=16`;
                    }}
                  />
                  <a 
                    href={coupon.store.website || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    {coupon.store.name || 'Unknown Store'}
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </a>
                </>
              ) : (
                <span className="text-muted-foreground">Store information not available</span>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Category</h4>
            <div className="flex items-center">
              {coupon.category ? (
                <>
                  <span className={`w-2 h-2 rounded-full ${coupon.category.color ? `bg-${coupon.category.color}-500` : 'bg-gray-500'} mr-1`}></span>
                  <span>{coupon.category.name || 'Unknown Category'}</span>
                </>
              ) : (
                <span className="text-muted-foreground">Category information not available</span>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Submitted By</h4>
            <div className="flex items-center">
              {coupon.user ? (
                <>
                  <img 
                    src={coupon.user.photoURL || ''} 
                    alt={coupon.user.displayName || 'User'}
                    className="w-4 h-4 mr-2 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(coupon.user.displayName || 'User')}&background=random&size=16`;
                    }}
                  />
                  <span>{coupon.user.displayName || coupon.user.email || 'Unknown User'}</span>
                </>
              ) : (
                <span className="text-muted-foreground">User information not available</span>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Submitted Date</h4>
            <span>{format(new Date(coupon.submittedAt || new Date()), 'MMM d, yyyy')}</span>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Expiration Date</h4>
            <span>{coupon.expiresAt ? format(new Date(coupon.expiresAt), 'MMM d, yyyy') : 'No expiration date'}</span>
          </div>
        </div>
        
        {coupon.terms && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-1">Terms & Conditions</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{coupon.terms}</p>
          </div>
        )}
        
        {coupon.reviewNotes && (
          <div className="mb-4 p-3 bg-muted rounded-md">
            <h4 className="text-sm font-medium mb-1">Review Notes</h4>
            <p className="text-sm whitespace-pre-line">{coupon.reviewNotes}</p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mt-4 justify-end">
          {/* Edit and Delete buttons available for all statuses */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
            className="gap-1"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onDelete}
            className="gap-1"
          >
            <Trash className="w-4 h-4" />
            Delete
          </Button>
          
          {/* Approve/Reject buttons only for pending submissions */}
          {showActions && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onReject}
                className="gap-1"
              >
                <ThumbsDown className="w-4 h-4" />
                Reject
              </Button>
              <Button 
                size="sm" 
                onClick={onApprove}
                className="gap-1"
              >
                <ThumbsUp className="w-4 h-4" />
                Approve
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};