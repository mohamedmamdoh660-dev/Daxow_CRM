import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Settings | Admission CRM',
    description: 'Configure your CRM settings',
};

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
