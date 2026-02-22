/**
 * Page Wrapper with Error Boundary and Production Features
 */

'use client';

import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import OneOnOnePage from './page';

export default function PageWrapper() {
    return (
        <ErrorBoundary>
            <OneOnOnePage />
        </ErrorBoundary>
    );
}

