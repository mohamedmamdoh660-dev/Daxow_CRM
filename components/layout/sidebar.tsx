'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
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
    User,
    LogOut,
    ShieldCheck,
    Shield,
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Map sidebar items to system modules
const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, module: 'Dashboard' },
    { name: 'Leads', href: '/leads', icon: UserPlus, module: 'Leads' },
    { name: 'Students', href: '/students', icon: Users, module: 'Students' },
    { name: 'Applications', href: '/applications', icon: FileText, module: 'Applications' },
    { name: 'Academic Years', href: '/academic-years', icon: Calendar, module: 'Academic Years' },
    { name: 'Semesters', href: '/semesters', icon: Clock, module: 'Academic Years' },
    { name: 'Programs', href: '/programs', icon: GraduationCap, module: 'Programs' },
    { name: 'Degrees', href: '/degrees', icon: GraduationCap, module: 'Programs' },
    { name: 'Faculties', href: '/faculties', icon: BookOpen, module: 'Faculties' },
    { name: 'Specialties', href: '/specialties', icon: Award, module: 'Faculties' },
    { name: 'Countries', href: '/countries', icon: Globe, module: 'Countries & Cities' },
    { name: 'Cities', href: '/cities', icon: MapPin, module: 'Countries & Cities' },
    { name: 'Languages', href: '/languages', icon: Languages, module: 'Languages & Titles' },
    { name: 'Titles', href: '/titles', icon: FileText, module: 'Languages & Titles' },
    { name: 'Agents', href: '/agents', icon: Briefcase, module: 'Agents' },
    { name: 'Users', href: '/users', icon: ShieldCheck, module: 'User Management' },
    { name: 'Roles', href: '/roles', icon: Shield, module: 'Roles & Permissions' },
    { name: 'Profile', href: '/profile', icon: User, module: 'Profile' },
    { name: 'Settings', href: '/settings', icon: Settings, module: 'Settings' },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Auth context loading simulation
    const [permissions, setPermissions] = useState<{ module: string, action: string }[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        try {
            const stored = localStorage.getItem('userMeta');
            const userRole = localStorage.getItem('userRole') || '';

            // Helper: grant all permissions including menu_access for admin
            const adminPerms = () => navigation.flatMap(n => [
                { module: n.module, action: 'read' },
                { module: n.module, action: 'menu_access' },
            ]);

            if (stored) {
                const meta = JSON.parse(stored);
                // If admin role, show everything
                if (userRole === 'admin' || meta?.role === 'admin') {
                    setPermissions(adminPerms());
                } else if (meta?.permissions && meta.permissions.length > 0) {
                    setPermissions(meta.permissions);
                }
            } else if (userRole === 'admin') {
                setPermissions(adminPerms());
            } else {
                // No meta stored yet — fetch from /api/auth/me
                fetch('/api/auth/me')
                    .then(res => res.ok ? res.json() : null)
                    .then(data => {
                        if (data?.user) {
                            localStorage.setItem('userMeta', JSON.stringify(data.user));
                            localStorage.setItem('userRole', data.user.role || '');
                            if (data.user.role === 'admin') {
                                setPermissions(adminPerms());
                            } else if (data.user.permissions?.length > 0) {
                                setPermissions(data.user.permissions);
                            }
                        }
                    })
                    .catch(() => {
                        // Fallback: show all links if fetch fails (non-critical)
                        setPermissions(adminPerms());
                    });
            }
        } catch (e) {
            // On any error, show all links so user isn't blocked
            setPermissions(navigation.flatMap(n => [
                { module: n.module, action: 'read' },
                { module: n.module, action: 'menu_access' },
            ]));
        }
    }, []);

    const hasAccess = (module: string) => {
        // Special modules always visible (Dashboard, Settings, Profile)
        const alwaysVisible = ['Dashboard', 'Settings', 'Profile'];
        if (alwaysVisible.includes(module)) {
            return permissions.some(p =>
                p.module === module &&
                ['view', 'add', 'edit', 'delete', 'export', 'import', 'read', 'manage', 'create', 'update', 'menu_access'].includes(p.action)
            );
        }
        // For all other modules: require explicit menu_access permission
        return permissions.some(p => p.module === module && p.action === 'menu_access');
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            if (response.ok) {
                localStorage.removeItem('userMeta');
                router.push('/login');
            } else {
                setIsLoggingOut(false);
            }
        } catch (error) {
            setIsLoggingOut(false);
        }
    };

    if (!isClient) return null; // Avoid hydration mismatch

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
                {navigation.filter(item => hasAccess(item.module)).map((item) => {
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

            {/* Logout Button */}
            <div className="border-t p-3">
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        'text-destructive hover:bg-destructive/10 hover:text-destructive',
                        isLoggingOut && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    <LogOut className="h-5 w-5" />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
            </div>
        </div>
    );
}
