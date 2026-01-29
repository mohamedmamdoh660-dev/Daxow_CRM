'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Building2,
    GraduationCap,
    FileText,
    Settings,
    Briefcase,
    UserPlus,
    Calendar,
    Clock,
    MapPin,
    BookOpen,
    Languages,
    Award,
    Globe,
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads', href: '/leads', icon: UserPlus },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Applications', href: '/applications', icon: FileText },
    { name: 'Academic Years', href: '/academic-years', icon: Calendar },
    { name: 'Semesters', href: '/semesters', icon: Clock },
    { name: 'Programs', href: '/programs', icon: GraduationCap },
    { name: 'Faculties', href: '/faculties', icon: BookOpen },
    { name: 'Specialties', href: '/specialties', icon: Award },
    { name: 'Titles', href: '/titles', icon: FileText },
    { name: 'Degrees', href: '/degrees', icon: GraduationCap },
    { name: 'Countries', href: '/countries', icon: Globe },
    { name: 'Cities', href: '/cities', icon: MapPin },
    { name: 'Languages', href: '/languages', icon: Languages },
    { name: 'Agents', href: '/agents', icon: Briefcase },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-card">
            {/* Logo */}
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">Admission CRM</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname?.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
