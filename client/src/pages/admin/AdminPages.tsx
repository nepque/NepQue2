import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { queryClient } from "@/lib/queryClient";
import { Trash, Edit, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Form schema for content pages
const pageFormSchema = z.object({
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  isPublished: z.boolean().default(true),
  noIndex: z.boolean().default(false),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  metaKeywords: z.string().nullable().optional(),
});

type PageFormValues = z.infer<typeof pageFormSchema>;

interface ContentPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  isPublished: boolean;
  noIndex: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  createdAt: string;
  updatedAt: string;
}

const AdminPages = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<ContentPage | null>(null);

  // Query to fetch all content pages
  const { data: pages, isLoading } = useQuery({
    queryKey: ['/api/admin/pages'],
    queryFn: async () => {
      const response = await fetch('/api/admin/pages', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch pages');
      }
      return response.json() as Promise<ContentPage[]>;
    }
  });

  // Form for creating new pages
  const createForm = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      slug: '',
      title: '',
      content: '',
      isPublished: true,
      noIndex: false,
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
    },
  });

  // Form for editing pages
  const editForm = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      slug: '',
      title: '',
      content: '',
      isPublished: true,
      noIndex: false,
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
    },
  });

  // Mutation for creating a page
  const createPageMutation = useMutation({
    mutationFn: async (values: PageFormValues) => {
      return apiRequest('/api/admin/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Page created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pages'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create page: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation for updating a page
  const updatePageMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: PageFormValues }) => {
      return apiRequest(`/api/admin/pages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Page updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pages'] });
      setIsEditDialogOpen(false);
      setSelectedPage(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update page: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting a page
  const deletePageMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/pages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Page deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pages'] });
      setIsDeleteDialogOpen(false);
      setSelectedPage(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete page: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onCreateSubmit = (values: PageFormValues) => {
    createPageMutation.mutate(values);
  };

  const onEditSubmit = (values: PageFormValues) => {
    if (selectedPage) {
      updatePageMutation.mutate({ id: selectedPage.id, values });
    }
  };

  const handleEditClick = (page: ContentPage) => {
    setSelectedPage(page);
    editForm.reset({
      slug: page.slug,
      title: page.title,
      content: page.content,
      isPublished: page.isPublished,
      noIndex: page.noIndex,
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      metaKeywords: page.metaKeywords || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (page: ContentPage) => {
    setSelectedPage(page);
    setIsDeleteDialogOpen(true);
  };

  return (
    <AdminLayout title="Content Pages">
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600">Manage static content pages like About Us, Privacy Policy, etc.</p>
        <Button 
          onClick={() => {
            createForm.reset(); // Reset form when opening
            setIsCreateDialogOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Page
        </Button>
      </div>

      {/* Pages list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </CardContent>
            </Card>
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </CardContent>
            </Card>
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </CardContent>
            </Card>
          </>
        ) : pages && pages.length > 0 ? (
          pages.map(page => (
            <Card key={page.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{page.title}</CardTitle>
                    <CardDescription>/{page.slug}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleEditClick(page)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="text-red-500 hover:text-red-600 hover:border-red-600"
                      onClick={() => handleDeleteClick(page)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className={`h-2 w-2 rounded-full ${page.isPublished ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span>{page.isPublished ? 'Published' : 'Draft'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`h-2 w-2 rounded-full ${page.noIndex ? 'bg-yellow-500' : 'bg-blue-500'}`}></span>
                    <span>{page.noIndex ? 'No-Index (Hidden from search engines)' : 'Indexed'}</span>
                  </div>
                  <div className="text-gray-500 text-xs mt-2">
                    Last updated: {new Date(page.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No content pages found. Create your first page to get started.</p>
          </div>
        )}
      </div>

      {/* Create Page Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Content Page</DialogTitle>
            <DialogDescription>
              Create a new content page that will be accessible from the site.
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={createForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Title</FormLabel>
                      <FormControl>
                        <Input placeholder="About Us" {...field} />
                      </FormControl>
                      <FormDescription>The title displayed on the page and in browser tabs.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="about-us" {...field} />
                      </FormControl>
                      <FormDescription>Will be accessible at /page/{field.value || 'slug'}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content (HTML)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="<h1>About Us</h1><p>Welcome to our website...</p>" 
                        className="min-h-[200px] font-mono"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      HTML content of the page. You can include headings, paragraphs, lists, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={createForm.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Published</FormLabel>
                        <FormDescription>
                          If turned off, the page will not be accessible to users.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="noIndex"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Hide from Search Engines</FormLabel>
                        <FormDescription>
                          If turned on, adds a noindex meta tag to prevent search engines from indexing this page.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="border p-4 rounded-md">
                <h3 className="font-medium mb-4">SEO Settings (Optional)</h3>
                <div className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Custom page title for search engines" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormDescription>
                          Overrides the page title in search results. If left empty, the page title will be used.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief description for search engine results" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormDescription>
                          A short description that appears in search engine results.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="metaKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Keywords</FormLabel>
                        <FormControl>
                          <Input placeholder="keyword1, keyword2, keyword3" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormDescription>
                          Comma-separated keywords related to the page.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={createPageMutation.isPending}
                >
                  {createPageMutation.isPending ? "Creating..." : "Create Page"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Page Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content Page</DialogTitle>
            <DialogDescription>
              Update the content and settings for this page.
            </DialogDescription>
          </DialogHeader>

          {selectedPage && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={editForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>The title displayed on the page and in browser tabs.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Will be accessible at /page/{field.value}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content (HTML)</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="min-h-[200px] font-mono"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        HTML content of the page. You can include headings, paragraphs, lists, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={editForm.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Published</FormLabel>
                          <FormDescription>
                            If turned off, the page will not be accessible to users.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="noIndex"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Hide from Search Engines</FormLabel>
                          <FormDescription>
                            If turned on, adds a noindex meta tag to prevent search engines from indexing this page.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border p-4 rounded-md">
                  <h3 className="font-medium mb-4">SEO Settings (Optional)</h3>
                  <div className="space-y-4">
                    <FormField
                      control={editForm.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Title</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                          <FormDescription>
                            Overrides the page title in search results. If left empty, the page title will be used.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ''} />
                          </FormControl>
                          <FormDescription>
                            A short description that appears in search engine results.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="metaKeywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Keywords</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                          <FormDescription>
                            Comma-separated keywords related to the page.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
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
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={updatePageMutation.isPending}
                  >
                    {updatePageMutation.isPending ? "Updating..." : "Update Page"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this page? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPage && (
            <>
              <div className="py-4">
                <p><strong>Page:</strong> {selectedPage.title}</p>
                <p><strong>URL:</strong> /page/{selectedPage.slug}</p>
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
                  variant="destructive"
                  onClick={() => deletePageMutation.mutate(selectedPage.id)}
                  disabled={deletePageMutation.isPending}
                >
                  {deletePageMutation.isPending ? "Deleting..." : "Delete Page"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPages;