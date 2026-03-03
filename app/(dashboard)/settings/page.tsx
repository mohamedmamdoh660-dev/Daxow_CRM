'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import {
    Settings,
    Shield,
    Radio,
    Paintbrush,
    Zap,
    GitBranch,
    Users2,
    Database,
    ShoppingBag,
    Code2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// ─────────────────────────────────────────────────────────────────────────────
// Settings sections — add items here, all non-implemented ones → /settings/coming-soon
// ─────────────────────────────────────────────────────────────────────────────
const SETTINGS_SECTIONS = [
    {
        id: 'general',
        name: 'General',
        icon: Settings,
        items: [
            { name: 'Company Settings', href: '/settings/coming-soon' },
            { name: 'Personal Settings', href: '/settings/coming-soon' },
            { name: 'Users', href: '/users' },
            { name: 'Calendar Booking', href: '/settings/coming-soon' },
            { name: 'Business Hours', href: '/settings/coming-soon' },
        ],
    },
    {
        id: 'security',
        name: 'Security Control',
        icon: Shield,
        items: [
            { name: 'Roles & Permissions', href: '/roles' },
            { name: 'Login History', href: '/settings/coming-soon' },
            { name: 'Audit Log', href: '/settings/coming-soon' },
            { name: 'Security Policies', href: '/settings/coming-soon' },
            { name: 'Support Access', href: '/settings/coming-soon' },
            { name: 'Trusted Domains', href: '/settings/coming-soon' },
        ],
    },
    {
        id: 'channels',
        name: 'Channels',
        icon: Radio,
        items: [
            { name: 'Email', href: '/settings/credentials' },
            { name: 'SMS', href: '/settings/coming-soon' },
            { name: 'WhatsApp', href: '/settings/coming-soon' },
            { name: 'Web Forms', href: '/settings/coming-soon' },
            { name: 'Social Media', href: '/settings/coming-soon' },
        ],
    },
    {
        id: 'customization',
        name: 'Customization',
        icon: Paintbrush,
        items: [
            { name: 'Modules & Fields', href: '/settings/coming-soon' },
            { name: 'Pipelines', href: '/settings/coming-soon' },
            { name: 'Statuses', href: '/settings/coming-soon' },
            { name: 'Templates', href: '/settings/coming-soon' },
            { name: 'Translations', href: '/settings/coming-soon' },
        ],
    },
    {
        id: 'automation',
        name: 'Automation',
        icon: Zap,
        items: [
            { name: 'Workflow Rules', href: '/settings/coming-soon' },
            { name: 'Actions', href: '/settings/coming-soon' },
            { name: 'Schedules', href: '/settings/coming-soon' },
            { name: 'Assignment Rules', href: '/settings/coming-soon' },
            { name: 'Scoring Rules', href: '/settings/coming-soon' },
        ],
    },
    {
        id: 'process',
        name: 'Process Management',
        icon: GitBranch,
        items: [
            { name: 'Approval Processes', href: '/settings/coming-soon' },
            { name: 'Review Processes', href: '/settings/coming-soon' },
            { name: 'Escalation Rules', href: '/settings/coming-soon' },
        ],
    },
    {
        id: 'data',
        name: 'Data Administration',
        icon: Database,
        items: [
            { name: 'Import', href: '/settings/coming-soon' },
            { name: 'Export', href: '/settings/coming-soon' },
            { name: 'Data Backup', href: '/settings/coming-soon' },
            { name: 'Recycle Bin', href: '/settings/coming-soon' },
            { name: 'Storage', href: '/settings/coming-soon' },
            { name: 'API Configuration', href: '/settings/api' },
        ],
    },
    {
        id: 'users',
        name: 'User Management',
        icon: Users2,
        items: [
            { name: 'User Groups', href: '/roles' },
            { name: 'Departments', href: '/settings/coming-soon' },
            { name: 'Territories', href: '/settings/coming-soon' },
            { name: 'Gamescope', href: '/settings/coming-soon' },
        ],
    },
    {
        id: 'integrations',
        name: 'Integrations',
        icon: ShoppingBag,
        items: [
            { name: 'Zapier', href: '/settings/coming-soon' },
            { name: 'Google Workspace', href: '/settings/coming-soon' },
            { name: 'Microsoft 365', href: '/settings/coming-soon' },
            { name: 'Webhooks', href: '/settings/coming-soon' },
        ],
    },
    {
        id: 'developer',
        name: 'Developer Hub',
        icon: Code2,
        items: [
            { name: 'APIs & SDKs', href: '/settings/api' },
            { name: 'Webhooks', href: '/settings/coming-soon' },
            { name: 'Variables', href: '/settings/coming-soon' },
            { name: 'Functions', href: '/settings/coming-soon' },
        ],
    },
];

export default function SettingsPage() {
    const [search, setSearch] = useState('');

    const filtered = search.trim()
        ? SETTINGS_SECTIONS.map(section => ({
            ...section,
            items: section.items.filter(item =>
                item.name.toLowerCase().includes(search.toLowerCase())
            ),
        })).filter(section => section.items.length > 0 || section.name.toLowerCase().includes(search.toLowerCase()))
        : SETTINGS_SECTIONS;

    return (
        <div className="min-h-full bg-[#f5f6fa]">
            {/* Header */}
            <div className="border-b bg-white px-8 py-5 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search settings..."
                        className="pl-9 bg-gray-50 border-gray-200"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                    {filtered.map((section) => {
                        const Icon = section.icon;
                        return (
                            <div
                                key={section.id}
                                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
                            >
                                {/* Section Header */}
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
                                    <div className="p-1.5 rounded-lg bg-primary/10">
                                        <Icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <h2 className="font-semibold text-sm text-gray-800">{section.name}</h2>
                                </div>

                                {/* Links */}
                                <ul className="space-y-1.5">
                                    {section.items.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className="text-sm text-gray-600 hover:text-primary hover:underline transition-colors block py-0.5"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* No results */}
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                        <Search className="h-12 w-12 mb-4 opacity-30" />
                        <p className="text-lg font-medium">No settings found</p>
                        <p className="text-sm">Try a different search term</p>
                    </div>
                )}
            </div>
        </div>
    );
}
