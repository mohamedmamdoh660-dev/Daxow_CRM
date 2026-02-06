import { ProgramForm } from '@/components/programs/program-form';
import { notFound } from 'next/navigation';

export default async function EditProgramPage({ params }: { params: { id: string } }) {
    // Determine API URL based on environment or use absolute URL if server-side fetch requires it
    // Using localhost for server-side fetch during dev
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    try {
        const res = await fetch(`${BACKEND_URL}/api/programs/${params.id}`, {
            cache: 'no-store'
        });

        if (!res.ok) {
            notFound();
        }

        const program = await res.json();

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
    } catch (error) {
        notFound();
    }
}
