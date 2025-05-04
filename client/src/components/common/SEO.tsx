import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonicalUrl?: string;
  noIndex?: boolean;
}

const SEO = ({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonicalUrl,
  noIndex = false,
}: SEOProps) => {
  const siteName = "NepQue";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  
  // Fetch verification code
  const { data: verificationData } = useQuery({
    queryKey: ['/api/site-verification'],
    staleTime: 3600000, // 1 hour
  });
  
  useEffect(() => {
    if (verificationData?.verificationCode) {
      setVerificationCode(verificationData.verificationCode);
    }
  }, [verificationData]);
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Robots directive */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Site verification code - Inserted as raw HTML */}
      {verificationCode && (
        <div dangerouslySetInnerHTML={{ __html: verificationCode }} />
      )}
    </Helmet>
  );
};

export default SEO;