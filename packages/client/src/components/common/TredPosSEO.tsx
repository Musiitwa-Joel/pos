import React from 'react';
import { Helmet } from 'react-helmet-async';

interface TredPosSEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const TredPosSEO: React.FC<TredPosSEOProps> = ({
  title,
  description,
  keywords,
  image = '/favicon/web-app-manifest-512x512.png',
  url = 'https://tredpos.com',
  type = 'website',
}) => {
  const siteTitle = 'TredPos Industries';
  const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} | Institutional Point-of-Sale`;
  const defaultDescription = 'Global point-of-sale infrastructure for high-density commercial operations. Real-time telemetry, forensic ledgering, and multi-node synchronization.';
  const displayDescription = description || defaultDescription;
  const defaultKeywords = 'POS, TredPos, Institutional POS, Global Commerce, Ledger Sync, Retail Infrastructure, Forensic Ledger';
  
  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={displayDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={displayDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={displayDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@tredpos" />

      {/* Industrial Robot Directives */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
    </Helmet>
  );
};

export default TredPosSEO;
