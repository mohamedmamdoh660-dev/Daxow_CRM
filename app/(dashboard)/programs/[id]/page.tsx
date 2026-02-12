'use client';

import { useState, useEffect } from 'react';
import { ProgramForm } from '@/components/programs/program-form';
import { useParams } from 'next/navigation';

export default function EditProgramPage() {
    const params = useParams();
    const [program, setProgram] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchProgram = async () => {
            try {
                const res = await fetch(`/api/programs/${params.id}`);
                if (!res.ok) {
                    setError(true);
                    return;
                }
                const data = await res.json();
                setProgram(data);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchProgram();
    }, [params.id]);

    if (loading) {
        return (
            <div className="container mx-auto py-10 max-w-4xl">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error || !program) {
        return (
            <div className="container mx-auto py-10 max-w-4xl">
                <div className="text-center py-16">
                    <h2 className="text-2xl font-bold text-destructive">Program Not Found</h2>
                    <p className="text-muted-foreground mt-2">The program you're looking for doesn't exist or has been deleted.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Edit Program</h1>
                <p className="text-muted-foreground">Update program details</p>
            </div>
            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <ProgramForm initialData={program} />
            </div>
        </div>
    );
}
