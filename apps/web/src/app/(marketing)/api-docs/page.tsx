'use client';

/**
 * Swagger UI Page for API Documentation
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { logger } from '@/lib/logger';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function APIDocsPage() {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/docs')
      .then((res) => res.json())
      .then((data) => {
        setSpec(data);
        setLoading(false);
      })
      .catch((error) => {
        logger.error('Failed to load API spec:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-destructive">Failed to load API documentation</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">AuraOS API Documentation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Interactive API documentation powered by OpenAPI 3.0
          </p>
        </div>
      </header>
      <main className="container mx-auto">
        <SwaggerUI spec={spec} />
      </main>
    </div>
  );
}

