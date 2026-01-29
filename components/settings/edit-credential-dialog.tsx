'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CREDENTIAL_PROVIDERS, StoredCredential } from '@/lib/credential-types';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface EditCredentialDialogProps {
    credential: StoredCredential | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function EditCredentialDialog({ credential, open, onOpenChange, onSuccess }: EditCredentialDialogProps) {
    const [name, setName] = useState('');
    const [credentials, setCredentials] = useState<Record<string, string>>({});
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);

    const provider = credential ? CREDENTIAL_PROVIDERS.find(p => p.id === credential.provider) : null;

    useEffect(() => {
        if (credential) {
            setName(credential.name);
            setCredentials(credential.credentials);
        }
    }, [credential]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!credential || !name) {
            toast.error('Please enter a name');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/credentials/${credential.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    credentials,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to update credential');
            }

            toast.success('Credential updated successfully');
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update credential');
        } finally {
            setLoading(false);
        }
    };

    if (!credential || !provider) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Credential</DialogTitle>
                    <DialogDescription>
                        Update your {provider.name} credentials
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Name</Label>
                        <Input
                            id="edit-name"
                            placeholder="e.g., Production Database"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Dynamic Fields */}
                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="text-sm font-semibold">Credentials</h4>
                        {provider.fields.map((field) => (
                            <div key={field.name} className="space-y-2">
                                <Label htmlFor={`edit-${field.name}`}>
                                    {field.label}
                                    {field.required && <span className="text-destructive ml-1">*</span>}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id={`edit-${field.name}`}
                                        type={field.type === 'password' && !showPasswords[field.name] ? 'password' : 'text'}
                                        placeholder={field.placeholder}
                                        value={credentials[field.name] || ''}
                                        onChange={(e) => setCredentials({
                                            ...credentials,
                                            [field.name]: e.target.value,
                                        })}
                                        required={field.required}
                                        className={field.type === 'password' ? 'pr-10' : ''}
                                    />
                                    {field.type === 'password' && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowPasswords({
                                                ...showPasswords,
                                                [field.name]: !showPasswords[field.name],
                                            })}
                                        >
                                            {showPasswords[field.name] ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Credential'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
