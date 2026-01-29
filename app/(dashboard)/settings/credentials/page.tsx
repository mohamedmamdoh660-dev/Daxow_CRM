'use client';

import { useState, useEffect } from 'react';
import { AddCredentialDialog } from '@/components/settings/add-credential-dialog';
import { EditCredentialDialog } from '@/components/settings/edit-credential-dialog';
import { CredentialCard } from '@/components/settings/credential-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StoredCredential } from '@/lib/credential-types';
import { toast } from 'sonner';
import { RefreshCw, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function CredentialsPage() {
    const [credentials, setCredentials] = useState<StoredCredential[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCredential, setEditingCredential] = useState<StoredCredential | null>(null);
    const [testingId, setTestingId] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({});

    const fetchCredentials = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/credentials');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setCredentials(data.credentials);
        } catch (error) {
            toast.error('Failed to load credentials');
        } finally {
            setLoading(false);
        }
    };

    const testConnection = async (credential: StoredCredential) => {
        setTestingId(credential.id);
        try {
            const res = await fetch('/api/credentials/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: credential.provider,
                    credentials: credential.credentials,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setConnectionStatus(prev => ({ ...prev, [credential.id]: true }));
                toast.success(`Connection to ${credential.name} successful`);
            } else {
                throw new Error(data.error || 'Connection failed');
            }
        } catch (error: any) {
            setConnectionStatus(prev => ({ ...prev, [credential.id]: false }));
            toast.error(error.message || 'Connection failed');
        } finally {
            setTestingId(null);
        }
    };

    const handleEdit = (id: string) => {
        const cred = credentials.find(c => c.id === id);
        if (cred) {
            setEditingCredential(cred);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this credential?')) return;

        try {
            const res = await fetch(`/api/credentials/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete');

            toast.success('Credential deleted successfully');
            fetchCredentials();
        } catch (error) {
            toast.error('Failed to delete credential');
        }
    };

    useEffect(() => {
        fetchCredentials();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Credentials</h1>
                    <p className="text-muted-foreground">
                        Manage your API credentials and data sources
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchCredentials} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <AddCredentialDialog onSuccess={fetchCredentials} />
                </div>
            </div>

            {loading && credentials.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading credentials...</span>
                </div>
            ) : credentials.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">No credentials yet</h3>
                    <p className="text-muted-foreground mb-4">
                        Add your first credential to get started
                    </p>
                    <AddCredentialDialog onSuccess={fetchCredentials} />
                </div>
            ) : (
                <div className="space-y-3">
                    {credentials.map((cred) => (
                        <div key={cred.id} className="relative">
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <CredentialCard
                                        credential={cred}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onTestConnection={testConnection}
                                        testing={testingId === cred.id}
                                    />
                                </div>
                                {connectionStatus[cred.id] !== undefined && (
                                    <Badge
                                        className={connectionStatus[cred.id] ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
                                    >
                                        {connectionStatus[cred.id] ? (
                                            <>
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Connected
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Failed
                                            </>
                                        )}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Dialog */}
            <EditCredentialDialog
                credential={editingCredential}
                open={!!editingCredential}
                onOpenChange={(open) => !open && setEditingCredential(null)}
                onSuccess={fetchCredentials}
            />
        </div>
    );
}
