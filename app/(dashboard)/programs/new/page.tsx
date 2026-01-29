import { ProgramForm } from '@/components/programs/program-form';

export default function NewProgramPage() {
    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Create New Program</h1>
                <p className="text-muted-foreground">Add a new academic program to the catalog</p>
            </div>
            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <ProgramForm />
            </div>
        </div>
    );
}
