'use client';

import Link from 'next/link';
import { Construction, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ComingSoonPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            {/* Icon */}
            <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <Construction className="h-12 w-12 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-amber-600" />
                </div>
            </div>

            {/* Text */}
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Coming Soon</h1>
            <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
                This feature is currently under development. We'll have it ready for you soon!
            </p>

            {/* Back button */}
            <Button asChild variant="outline">
                <Link href="/settings" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Settings
                </Link>
            </Button>
        </div>
    );
}
