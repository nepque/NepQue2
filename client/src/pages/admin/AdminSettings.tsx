import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Schema for site settings form
const settingsSchema = z.object({
  header_verification_code: z.string(),
  header_verification_description: z.string().optional(),
});

type FormData = z.infer<typeof settingsSchema>;

const AdminSettings = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      header_verification_code: "",
      header_verification_description: "",
    },
  });

  // Fetch existing settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
    onSuccess: (data) => {
      // Set form values based on retrieved settings
      const headerCode = data?.find((s) => s.key === "header_verification_code");
      const headerDesc = data?.find((s) => s.key === "header_verification_description");
      
      form.setValue("header_verification_code", headerCode?.value || "");
      form.setValue("header_verification_description", headerDesc?.value || "");
    },
  });

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