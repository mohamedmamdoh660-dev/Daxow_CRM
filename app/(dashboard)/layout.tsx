import { Sidebar } from '@/components/layout/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from 'sonner';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 overflow-y-auto bg-background">
                {children}
            </main>
            <Toaster />
            <Sonner richColors position="top-right" />
        </div>
    );
}
