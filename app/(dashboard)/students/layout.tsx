import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Students | Admission CRM',
    description: 'Manage students and applications',
};

export default function StudentsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
