'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Settings as SettingsIcon,
    Database,
    Users,
    Shield,
    Bell,
    Palette,
    Mail,
    Workflow,
    FileText,
    Code,
    ChevronRight
} from 'lucide-react';

const settingsSections = [
    {
        id: 'general',
        name: 'General',
        icon: SettingsIcon,
        items: [
            { name: 'Company Settings', href: '/settings/company' },
            { name: 'Personal Settings', href: '/settings/personal' },
            { name: 'Users', href: '/settings/users' },
        ],
    },
    {
        id: 'integration',
        name: 'Integration',
        icon: Database,
        items: [
            { name: 'Credentials', href: '/settings/credentials' },
            { name: 'API Configuration', href: '/settings/api' },
            { name: 'Database Connection', href: '/settings/database' },
            { name: 'Storage Settings', href: '/settings/storage' },
        ],
    },
    {
        id: 'security',
        name: 'Security',
        icon: Shield,
        items: [
            { name: 'Roles and Permissions', href: '/settings/roles' },
            { name: 'Authentication', href: '/settings/auth' },
            { name: 'Security Policies', href: '/settings/security-policies' },
        ],
    },
    {
        id: 'automation',
        name: 'Automation',
        icon: Workflow,
        items: [
            { name: 'Workflow Rules', href: '/settings/workflows' },
            { name: 'Email Templates', href: '/settings/email-templates' },
            { name: 'Actions', href: '/settings/actions' },
        ],
    },
    {
        id: 'customization',
        name: 'Customization',
        icon: Palette,
        items: [
            { name: 'Modules and Fields', href: '/settings/modules' },
            { name: 'Pipelines', href: '/settings/pipelines' },
            { name: 'Statuses', href: '/settings/statuses' },
        ],
    },
    {
        id: 'notifications',
        name: 'Notifications',
        icon: Bell,
        items: [
            { name: 'Email Notifications', href: '/settings/email-notifications' },
            { name: 'SMS Settings', href: '/settings/sms' },
            { name: 'Push Notifications', href: '/settings/push' },
        ],
    },
];

export default function SettingsPage() {
    const pathname = usePathname();
    const [selectedSection, setSelectedSection] = useState(
        pathname?.includes('/api') ? 'integration' : 'general'
    );

    const currentSection = settingsSections.find(s => s.id === selectedSection);

    return (
        <div className="flex h-full">
            {/* Sidebar Navigation */}
            <aside className="w-64 border-r bg-muted/10 p-4 space-y-1">
                {settingsSections.map((section) => {
                    const Icon = section.icon;
                    const isActive = selectedSection === section.id;
                    return (
                        <button
                            key={section.id}
                            onClick={() => setSelectedSection(section.id)}
                            className={cn(
                                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted text-muted-foreground'
                            )}
                        >
                            <Icon className="h-5 w-5 shrink-0" />
                            {section.name}
                        </button>
                    );
                })}
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-5xl">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-2">{currentSection?.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            Configure {currentSection?.name.toLowerCase()} settings
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {currentSection?.items.map((item) => {
                            const isAvailable = item.href === '/settings/api' ||
                                item.href === '/settings/credentials' ||
                                item.href === '/settings/statuses' ||
                                item.href === '/settings/modules';

                            return (
                                <Link
                                    key={item.href}
                                    href={isAvailable ? item.href : '#'}
                                    className={cn(
                                        'group flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent transition-colors',
                                        !isAvailable && 'opacity-50 pointer-events-none'
                                    )}
                                >
                                    <span className="text-sm font-medium">{item.name}</span>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    {!isAvailable && (
                                        <span className="ml-2 text-xs text-muted-foreground">(Soon)</span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
