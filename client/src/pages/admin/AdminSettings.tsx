import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const settingsSchema = z.object({
  header_verification_code: z.string().optional(),
  header_verification_description: z.string().optional(),
});

type FormData = z.infer<typeof settingsSchema>;

const AdminSettings = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Invalidate the settings query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    } catch (error) {
      console.error("Failed to update settings:", error);
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
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">
            Manage site-wide settings and verification codes for search engines.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Engine Verification</CardTitle>
            <CardDescription>
              Add verification codes for Google Search Console, Bing Webmaster Tools, etc.
              These codes will be added to the <code>&lt;head&gt;</code> section of your website.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-28" />
              </div>
            ) : (
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
                            placeholder="<meta name='google-site-verification' content='your_verification_code' />"
                            className="font-mono"
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Paste the full HTML meta tag or script provided by the search engine. 
                          This code will be inserted in the website&apos;s head section.
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Google Search Console verification"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Add a description to help remember what this code is for
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

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