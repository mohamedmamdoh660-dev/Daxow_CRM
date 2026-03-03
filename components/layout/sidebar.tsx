'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogOut, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NAV_ITEMS, PERMISSION_MODULES } from '@/lib/config/modules';

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [permissions, setPermissions] = useState<{ module: string, action: string }[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        try {
            const stored = localStorage.getItem('userMeta');
            const userRole = localStorage.getItem('userRole') || '';

            // Admin gets full access to all modules
            const adminPerms = () => PERMISSION_MODULES.flatMap(m => [
                { module: m, action: 'menu_access' },
                { module: m, action: 'view' },
            ]);

            if (stored) {
                const meta = JSON.parse(stored);
                if (userRole === 'admin' || meta?.role === 'admin') {
                    setPermissions(adminPerms());
                } else if (meta?.permissions?.length > 0) {
                    setPermissions(meta.permissions);
                }
            } else if (userRole === 'admin') {
                setPermissions(adminPerms());
            } else {
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
                    .catch(() => setPermissions(adminPerms()));
            }
        } catch {
            // Fallback: show everything — gets corrected on next proper load
            setPermissions(PERMISSION_MODULES.flatMap(m => [
                { module: m, action: 'menu_access' },
                { module: m, action: 'view' },
            ]));
        }
    }, []);

    /** Returns true if the user has access to show the nav item */
    const hasAccess = (permissionModule: string) => {
        // Dashboard, Settings, Profile: any permission grants access
        const alwaysVisible = ['Dashboard', 'Settings', 'Profile'];
        if (alwaysVisible.includes(permissionModule)) {
            return permissions.some(p =>
                p.module === permissionModule &&
                ['view', 'view_all', 'add', 'edit', 'delete', 'menu_access'].includes(p.action)
            );
        }
        // All other modules: require explicit menu_access
        return permissions.some(p => p.module === permissionModule && p.action === 'menu_access');
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
        } catch {
            setIsLoggingOut(false);
        }
    };

    if (!isClient) return null;

    return (
        <div className="flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-card">
            {/* Logo */}
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">Admission CRM</span>
                </Link>
            </div>

            {/* Navigation — driven by NAV_ITEMS in lib/config/modules.ts */}
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                {NAV_ITEMS.filter(item => hasAccess(item.permissionModule)).map((item) => {
                    const isActive = pathname?.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
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
