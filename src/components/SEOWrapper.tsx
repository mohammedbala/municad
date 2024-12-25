import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
  canonicalUrl: string;
}

export function SEOWrapper({ title, description, children, canonicalUrl }: SEOWrapperProps) {
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://municad.com${canonicalUrl}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://municad.com${canonicalUrl}`} />
      </Helmet>
      {children}
    </>
  );
} 