'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface User {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    isActive: boolean;
}

interface Agent {
    id: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    isActive?: boolean;
}

interface OwnerSelectorProps {
    ownerType?: string;
    ownerId?: string;
    onOwnerTypeChange: (type: string) => void;
    onOwnerIdChange: (id: string) => void;
    /** Shows a required star (*) and inline validation messages */
    required?: boolean;
    /** Pre-fills with this userId + ownerType='Direct' on mount (for logged-in user default) */
    initialUserId?: string;
    /** Pre-fills ownerType on mount. Defaults to 'Direct' if initialUserId provided */
    initialOwnerType?: string;
}

/**
 * Owner Selector Component
 *
 * Lets the user pick the owner type (Direct User or Agent),
 * then shows the appropriate active users or agents list.
 *
 * - ownerType = 'Direct' → pick from active Users
 * - ownerType = 'Agent'  → pick from active Agents
 *
 * Props:
 *   required        → marks field as required, shows * and validation
 *   initialUserId   → auto-sets ownerType='Direct' + ownerId=initialUserId on mount
 *   initialOwnerType → overrides the auto-set ownerType (default: 'Direct')
 */
export function OwnerSelector({
    ownerType,
    ownerId,
    onOwnerTypeChange,
    onOwnerIdChange,
    required,
    initialUserId,
    initialOwnerType,
}: OwnerSelectorProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(false);

    // Auto-set logged-in user as default on first mount (only when fields are empty)
    useEffect(() => {
        if (!ownerType && !ownerId && initialUserId) {
            onOwnerTypeChange(initialOwnerType || 'Direct');
            onOwnerIdChange(initialUserId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialUserId]);

    // Fetch active users when ownerType = Direct
    useEffect(() => {
        if (ownerType !== 'Direct') return;
        setLoading(true);
        fetch('/api/users?page=1&pageSize=100')
            .then(r => r.json())
            .then(data => {
                const allUsers: User[] = data.users || [];
                setUsers(allUsers.filter(u => u.isActive));
            })
            .finally(() => setLoading(false));
    }, [ownerType]);

    // Fetch active agents when ownerType = Agent
    useEffect(() => {
        if (ownerType !== 'Agent') return;
        setLoading(true);
        fetch('/api/agents?page=1&pageSize=100')
            .then(r => r.json())
            .then(data => {
                const allAgents: Agent[] = data.data || data.agents || data || [];
                setAgents(allAgents.filter(a => a.isActive !== false));
            })
            .finally(() => setLoading(false));
    }, [ownerType]);

    const getUserLabel = (u: User) =>
        u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;

    const getAgentLabel = (a: Agent) =>
        a.companyName || `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Agent';

    const RequiredStar = () =>
        required ? <span className="text-destructive ml-0.5">*</span> : null;

    const showTypeError = required && !ownerType;
    const showOwnerError = required && ownerType && !ownerId;

    return (
        <div className="space-y-3">
            {/* Owner Type */}
            <div className="space-y-1.5">
                <Label>
                    Owner Type <RequiredStar />
                </Label>
                <Select
                    value={ownerType || ''}
                    onValueChange={(val) => {
                        onOwnerTypeChange(val);
                        onOwnerIdChange(''); // Reset owner when type changes
                    }}
                >
                    <SelectTrigger className={showTypeError ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select owner type..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Direct">Direct (User)</SelectItem>
                        <SelectItem value="Agent">Agent</SelectItem>
                    </SelectContent>
                </Select>
                {showTypeError && (
                    <p className="text-xs text-destructive">Owner type is required</p>
                )}
            </div>

            {/* User dropdown when Direct */}
            {ownerType === 'Direct' && (
                <div className="space-y-1.5">
                    <Label>
                        Owner (User) <RequiredStar />
                    </Label>
                    <Select
                        value={ownerId || ''}
                        onValueChange={onOwnerIdChange}
                        disabled={loading}
                    >
                        <SelectTrigger className={showOwnerError ? 'border-destructive' : ''}>
                            <SelectValue
                                placeholder={loading ? 'Loading users...' : 'Select active user...'}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {users.map(u => (
                                <SelectItem key={u.id} value={u.id}>
                                    {getUserLabel(u)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {showOwnerError && (
                        <p className="text-xs text-destructive">Owner user is required</p>
                    )}
                </div>
            )}

            {/* Agent dropdown when Agent */}
            {ownerType === 'Agent' && (
                <div className="space-y-1.5">
                    <Label>
                        Owner (Agent) <RequiredStar />
                    </Label>
                    <Select
                        value={ownerId || ''}
                        onValueChange={onOwnerIdChange}
                        disabled={loading}
                    >
                        <SelectTrigger className={showOwnerError ? 'border-destructive' : ''}>
                            <SelectValue
                                placeholder={loading ? 'Loading agents...' : 'Select active agent...'}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {agents.map(a => (
                                <SelectItem key={a.id} value={a.id}>
                                    {getAgentLabel(a)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {showOwnerError && (
                        <p className="text-xs text-destructive">Owner agent is required</p>
                    )}
                </div>
            )}
        </div>
    );
}
