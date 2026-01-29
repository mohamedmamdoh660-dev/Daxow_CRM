'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CREDENTIAL_PROVIDERS, StoredCredential } from '@/lib/credential-types';
import { Edit, Trash2, MoreVertical, Wifi } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface CredentialCardProps {
    credential: StoredCredential;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onTestConnection?: (credential: StoredCredential) => void;
    testing?: boolean;
}

export function CredentialCard({ credential, onEdit, onDelete, onTestConnection, testing }: CredentialCardProps) {
    const provider = CREDENTIAL_PROVIDERS.find(p => p.id === credential.provider);
    const Icon = provider?.icon;

    const getTagColor = (tag?: string) => {
        switch (tag) {
            case 'personal':
                return 'bg-blue-500';
            case 'shared':
                return 'bg-green-500';
            case 'team':
                return 'bg-purple-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <Card className="hover:bg-accent/50 transition-colors">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        {Icon && (
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Icon className="h-5 w-5 text-primary" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold truncate">{credential.name}</h3>
                                <Badge variant="secondary" className={`text-white ${getTagColor(credential.tag)}`}>
                                    {credential.tag || 'Personal'}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {provider?.name} • Updated {formatDistanceToNow(new Date(credential.updatedAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onTestConnection?.(credential)}
                            disabled={testing}
                        >
                            <Wifi className="h-4 w-4 mr-2" />
                            {testing ? 'Testing...' : 'Test'}
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit?.(credential.id)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onDelete?.(credential.id)}
                                    className="text-destructive"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
