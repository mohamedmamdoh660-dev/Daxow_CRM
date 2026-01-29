'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Database, Cloud, RefreshCw, CheckCircle2, XCircle, AlertCircle, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface ConnectionStatus {
    database: {
        connected: boolean;
        type: string;
        provider: string;
        error: string | null;
    };
    supabaseStorage: {
        connected: boolean;
        configured: boolean;
        bucket: string;
        error: string | null;
    };
}

export default function APIConfigPage() {
    const [status, setStatus] = useState<ConnectionStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Supabase credentials
    const [showKeys, setShowKeys] = useState(false);
    const [supabaseUrl, setSupabaseUrl] = useState('');
    const [supabaseKey, setSupabaseKey] = useState('');

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings/connection-status');
            const data = await res.json();
            setStatus(data);
        } catch (error) {
            toast.error('Failed to fetch connection status');
        } finally {
            setLoading(false);
        }
    };

    const saveCredentials = async () => {
        if (!supabaseUrl || !supabaseKey) {
            toast.error('Please fill all fields');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/settings/supabase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: supabaseUrl,
                    key: supabaseKey,
                }),
            });

            if (res.ok) {
                toast.success('Credentials saved! Please restart the application.');
                fetchStatus();
            } else {
                const error = await res.json();
                toast.error(error.error || 'Failed to save credentials');
            }
        } catch (error) {
            toast.error('Error saving credentials');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const StatusIcon = ({ connected, error }: { connected: boolean; error: string | null }) => {
        if (error) return <XCircle className="h-5 w-5 text-destructive" />;
        if (connected) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    };

    const StatusBadge = ({ connected, error }: { connected: boolean; error: string | null }) => {
        if (error) return <Badge variant="destructive">Disconnected</Badge>;
        if (connected) return <Badge className="bg-green-500">Connected</Badge>;
        return <Badge variant="secondary">Not Configured</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">API Configuration</h1>
                    <p className="text-muted-foreground">
                        Configure external service connections
                    </p>
                </div>
                <Button onClick={fetchStatus} disabled={loading} variant="outline" size="sm">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {loading && !status ? (
                <Card>
                    <CardContent className="py-8">
                        <div className="flex items-center justify-center">
                            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-muted-foreground">Loading status...</span>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Database Status */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Database className="h-6 w-6 text-primary" />
                                    <div>
                                        <CardTitle>Database Connection</CardTitle>
                                        <CardDescription>
                                            {status?.database.type} via Prisma
                                        </CardDescription>
                                    </div>
                                </div>
                                <StatusBadge
                                    connected={status?.database.connected || false}
                                    error={status?.database.error || null}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <StatusIcon
                                        connected={status?.database.connected || false}
                                        error={status?.database.error || null}
                                    />
                                    <span className="text-sm font-medium">
                                        {status?.database.connected ? 'Connected' : 'Disconnected'}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p><strong>Provider:</strong> {status?.database.provider}</p>
                                    <p><strong>Type:</strong> {status?.database.type}</p>
                                    {status?.database.error && (
                                        <p className="text-destructive">
                                            <strong>Error:</strong> {status.database.error}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Supabase Storage Configuration */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Cloud className="h-6 w-6 text-primary" />
                                    <div>
                                        <CardTitle>Supabase Storage</CardTitle>
                                        <CardDescription>
                                            Configure file storage credentials
                                        </CardDescription>
                                    </div>
                                </div>
                                <StatusBadge
                                    connected={status?.supabaseStorage.connected || false}
                                    error={status?.supabaseStorage.error || null}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Current Status */}
                                <div className="flex items-center gap-2 pb-4 border-b">
                                    <StatusIcon
                                        connected={status?.supabaseStorage.connected || false}
                                        error={status?.supabaseStorage.error || null}
                                    />
                                    <span className="text-sm font-medium">
                                        {status?.supabaseStorage.connected
                                            ? 'Connected'
                                            : status?.supabaseStorage.configured
                                                ? 'Configured but not connected'
                                                : 'Not Configured'}
                                    </span>
                                </div>

                                {/* Configuration Form */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold">Credentials</h4>

                                    <div className="space-y-2">
                                        <Label htmlFor="supabase-url">Supabase URL</Label>
                                        <Input
                                            id="supabase-url"
                                            placeholder="https://your-project.supabase.co"
                                            value={supabaseUrl}
                                            onChange={(e) => setSupabaseUrl(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Project URL from Supabase Dashboard → Settings → API
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="supabase-key">Service Role Key</Label>
                                        <div className="relative">
                                            <Input
                                                id="supabase-key"
                                                type={showKeys ? 'text' : 'password'}
                                                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                                value={supabaseKey}
                                                onChange={(e) => setSupabaseKey(e.target.value)}
                                                className="pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3"
                                                onClick={() => setShowKeys(!showKeys)}
                                            >
                                                {showKeys ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Service Role Key from Supabase Dashboard → Settings → API
                                        </p>
                                    </div>

                                    <Button onClick={saveCredentials} disabled={saving} className="w-full">
                                        {saving ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Credentials
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Setup Instructions */}
                                <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                                    <p className="text-sm font-medium">Next Steps:</p>
                                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                                        <li>Add your Supabase credentials above</li>
                                        <li>Create bucket: <code className="bg-background px-1 rounded">student-documents</code> in Supabase Storage</li>
                                        <li>Set bucket to Public</li>
                                        <li>Restart the application</li>
                                    </ol>
                                </div>

                                {status?.supabaseStorage.error && (
                                    <p className="text-sm text-destructive">
                                        <strong>Error:</strong> {status.supabaseStorage.error}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
