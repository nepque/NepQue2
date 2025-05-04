import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/common/SEO";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentPageData {
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

const ContentPage = () => {
  // Check both route patterns for the slug
  const [matchWithPage, paramsWithPage] = useRoute("/page/:slug");
  const [matchDirect, paramsDirect] = useRoute("/:slug");
  
  // Get the slug from whichever route matched
  const slug = (matchWithPage ? paramsWithPage?.slug : paramsDirect?.slug) || "";
  
  // Skip homepage and known routes to avoid conflicts
  const skipRoutes = [
    "about", "faq", "contact", "privacy-policy", "terms-of-service", 
    "coupons", "admin", "profile", "search", "withdrawals", "earn", 
    "spin", "submit-coupon"
  ];
  
  const isValidContentPage = !skipRoutes.includes(slug);
  
  const { data: page, isLoading, error } = useQuery({
    queryKey: [`/api/pages/${slug}`],
    queryFn: async () => {
      const response = await fetch(`/api/pages/${slug}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.statusText}`);
      }
      return response.json() as Promise<ContentPageData>;
    },
    // Only run the query if we have a slug and it's not one of our known routes
    enabled: !!slug && isValidContentPage,
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/6 mb-8" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  // If we're trying to load a reserved route, we should show 404
  if (!isValidContentPage) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Return to Home
        </a>
      </div>
    );
  }
  
  // Show error for API errors or no page found
  if (error || !page) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Return to Home
        </a>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <SEO 
        title={page.metaTitle || page.title} 
        description={page.metaDescription || ""} 
        keywords={page.metaKeywords || ""}
        noIndex={page.noIndex}
      />
      
      <article className="prose lg:prose-xl max-w-none">
        <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>
    </div>
  );
};

export default ContentPage;