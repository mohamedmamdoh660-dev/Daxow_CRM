'use client';

import { Suspense } from 'react';
import { NewLeadForm } from './new-lead-form';

export default function NewLeadPage() {
    return (
        <Suspense fallback={
            <div className="container py-8 max-w-3xl">
                <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
                    <div className="bg-muted rounded-lg p-8">
                        <div className="space-y-4">
                            <div className="h-6 bg-muted-foreground/20 rounded w-1/3"></div>
                            <div className="h-32 bg-muted-foreground/20 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <NewLeadForm />
        </Suspense>
    );
}
