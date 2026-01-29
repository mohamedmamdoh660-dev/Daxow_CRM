'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CREDENTIAL_PROVIDERS, CredentialProvider } from '@/lib/credential-types';
import { toast } from 'sonner';
import { Loader2, Plus, Eye, EyeOff } from 'lucide-react';

interface AddCredentialDialogProps {
    onSuccess?: () => void;
}

export function AddCredentialDialog({ onSuccess }: AddCredentialDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<string>('');
    const [name, setName] = useState('');
    const [credentials, setCredentials] = useState<Record<string, string>>({});
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);

    const provider = CREDENTIAL_PROVIDERS.find(p => p.id === selectedProvider);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedProvider || !name) {
            toast.error('Please select a provider and enter a name');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: selectedProvider,
                    name,
                    credentials,
                    tag: 'personal',
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to save credential');
            }

            toast.success('Credential saved successfully');
            setOpen(false);
            resetForm();
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save credential');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedProvider('');
        setName('');
        setCredentials({});
        setShowPasswords({});
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Credential
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Credential</DialogTitle>
                    <DialogDescription>
                        Select a provider and enter your credentials
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Provider Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="provider">Provider</Label>
                        <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a provider" />
                            </SelectTrigger>
                            <SelectContent>
                                {CREDENTIAL_PROVIDERS.map((p) => {
                                    const Icon = p.icon;
                                    return (
                                        <SelectItem key={p.id} value={p.id}>
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4" />
                                                <span>{p.name}</span>
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Production Database"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Dynamic Fields */}
                    {provider && (
                        <div className="space-y-4 pt-4 border-t">
                            <h4 className="text-sm font-semibold">Credentials</h4>
                            {provider.fields.map((field) => (
                                <div key={field.name} className="space-y-2">
                                    <Label htmlFor={field.name}>
                                        {field.label}
                                        {field.required && <span className="text-destructive ml-1">*</span>}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id={field.name}
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
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !selectedProvider}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Credential'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
