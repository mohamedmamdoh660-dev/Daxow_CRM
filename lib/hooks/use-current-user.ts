'use client';

import { useState, useEffect } from 'react';

interface CurrentUser {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role?: string;
    isActive?: boolean;
}

/**
 * Hook to get the currently logged-in user.
 * Fetches from /api/auth/me (which reads the access_token cookie).
 */
export function useCurrentUser() {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => r.json())
            .then(data => {
                if (data?.user) {
                    setUser(data.user);
                }
            })
            .catch(() => {
                // Silently fail — user stays null
            })
            .finally(() => setLoading(false));
    }, []);

    return { user, loading };
}
