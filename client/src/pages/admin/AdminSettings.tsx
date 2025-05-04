import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Trash, Edit, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Schema for site settings form
const settingsSchema = z.object({
  header_verification_code: z.string(),
  header_verification_description: z.string().optional(),
});

type FormData = z.infer<typeof settingsSchema>;

// Schema for social media link form
const socialMediaLinkSchema = z.object({
  platform: z.string().min(1, 'Platform name is required'),
  icon: z.string().min(1, 'Icon name is required'),
  url: z.string().url('Please enter a valid URL').min(1, 'URL is required'),
  isActive: z.boolean().default(true),
});

type SocialMediaLinkFormData = z.infer<typeof socialMediaLinkSchema>;

// Social media link item type
interface SocialMediaLink {
  id: number;
  platform: string;
  icon: string;
  url: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminSettings = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [isAddLinkDialogOpen, setIsAddLinkDialogOpen] = useState(false);
  const [isEditLinkDialogOpen, setIsEditLinkDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<SocialMediaLink | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      header_verification_code: "",
      header_verification_description: "",
    },
  });
  
  // Form for adding/editing social media links
  const socialMediaLinkForm = useForm<SocialMediaLinkFormData>({
    resolver: zodResolver(socialMediaLinkSchema),
    defaultValues: {
      platform: "",
      icon: "",
      url: "",
      isActive: true,
    },
  });

  // Fetch existing settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
    onSuccess: (data) => {
      // Set form values based on retrieved settings
      const headerCode = data?.find((s: any) => s.key === "header_verification_code");
      const headerDesc = data?.find((s: any) => s.key === "header_verification_description");
      
      form.setValue("header_verification_code", headerCode?.value || "");
      form.setValue("header_verification_description", headerDesc?.value || "");
    },
  });
  
  // Fetch social media links
  const { data: socialMediaLinks, isLoading: isLoadingLinks } = useQuery({
    queryKey: ["/api/admin/social-media-links"],
  });

  // Create social media link
  const createSocialLinkMutation = useMutation({
    mutationFn: async (data: SocialMediaLinkFormData) => {
      return await apiRequest("/api/admin/social-media-links", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Social media link has been created.",
      });
      setIsAddLinkDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social-media-links"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social-media-links"] });
      socialMediaLinkForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create social media link.",
        variant: "destructive",
      });
    },
  });
  
  // Update social media link
  const updateSocialLinkMutation = useMutation({
    mutationFn: async (data: SocialMediaLinkFormData & { id: number }) => {
      return await apiRequest(`/api/admin/social-media-links/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Social media link has been updated.",
      });
      setIsEditLinkDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social-media-links"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social-media-links"] });
      setSelectedLink(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update social media link.",
        variant: "destructive",
      });
    },
  });
  
  // Toggle social media link status
  const toggleSocialLinkMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/social-media-links/${id}/toggle`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Social media link status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social-media-links"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social-media-links"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update social media link status.",
        variant: "destructive",
      });
    },
  });
  
  // Delete social media link
  const deleteSocialLinkMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/social-media-links/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Social media link has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social-media-links"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social-media-links"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete social media link.",
        variant: "destructive",
      });
    },
  });
  
  const handleAddLink = (data: SocialMediaLinkFormData) => {
    createSocialLinkMutation.mutate(data);
  };
  
  const handleEditLink = (data: SocialMediaLinkFormData) => {
    if (!selectedLink) return;
    updateSocialLinkMutation.mutate({
      ...data,
      id: selectedLink.id,
    });
  };
  
  const handleToggleLink = (id: number) => {
    toggleSocialLinkMutation.mutate(id);
  };
  
  const handleDeleteLink = (id: number) => {
    if (confirm("Are you sure you want to delete this social media link?")) {
      deleteSocialLinkMutation.mutate(id);
    }
  };
  
  const openEditDialog = (link: SocialMediaLink) => {
    setSelectedLink(link);
    socialMediaLinkForm.setValue("platform", link.platform);
    socialMediaLinkForm.setValue("icon", link.icon);
    socialMediaLinkForm.setValue("url", link.url);
    socialMediaLinkForm.setValue("isActive", link.isActive);
    setIsEditLinkDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Update or create the header verification code setting
      await apiRequest("/api/admin/settings", {
        method: "POST",
        body: JSON.stringify({
          key: "header_verification_code",
          value: data.header_verification_code,
          description: data.header_verification_description || "Verification code for search engines",
        }),
      });

      toast({
        title: "Settings updated",
        description: "Your site settings have been updated successfully.",
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/site-verification"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Site Settings">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>SEO Verification</CardTitle>
            <CardDescription>
              Add verification codes for search engines like Google Search Console and Bing Webmaster Tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="header_verification_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="<meta name='google-site-verification' content='YOUR_CODE' />"
                          className="font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Paste the full HTML verification code provided by the search engine.
                        This will be added to the <code>&lt;head&gt;</code> section of your website.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="header_verification_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Google Search Console verification code"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Add a note to help you remember what this code is for.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Settings
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : null}

        {settings && settings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>All Settings</CardTitle>
              <CardDescription>
                Overview of all configured site settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.map((setting) => (
                    <TableRow key={setting.id}>
                      <TableCell className="font-medium">{setting.key}</TableCell>
                      <TableCell>{setting.description}</TableCell>
                      <TableCell>{new Date(setting.updatedAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;