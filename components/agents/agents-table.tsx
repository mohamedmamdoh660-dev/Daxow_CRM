'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Plus, ExternalLink, Shield } from 'lucide-react';
import { AgentProfile } from '@/types/agents';
import Link from 'next/link';

import { RegisterAgentDialog } from './register-agent-dialog';

interface AgentsTableProps {
    data: AgentProfile[];
    onSearch?: (query: string) => void;
    onDelete?: (id: string) => void;
}

export function AgentsTable({ data, onSearch }: AgentsTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (onSearch) onSearch(query);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search agents..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="pl-8"
                    />
                </div>
                {/* Admin Action: Add New Agent manually if needed */}
                <Button onClick={() => setIsRegisterOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Register New Agency
                </Button>
            </div>

            <RegisterAgentDialog
                open={isRegisterOpen}
                onOpenChange={setIsRegisterOpen}
                onSuccess={() => {
                    if (onSearch) onSearch(searchQuery); // Refresh list
                }}
            />


            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Company Name</TableHead>
                            <TableHead>Contact Person</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No agents found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((agent) => (
                                <TableRow key={agent.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{agent.companyName}</span>
                                            {/* We could show ID or Code if available */}
                                        </div>
                                    </TableCell>
                                    <TableCell>{agent.contactPerson || '-'}</TableCell>
                                    <TableCell>{agent.email || '-'}</TableCell>
                                    <TableCell>
                                        {agent.city && agent.country
                                            ? `${agent.city}, ${agent.country}`
                                            : (agent.country || '-')}
                                    </TableCell>
                                    <TableCell>
                                        {agent.commissionRate ? `${Number(agent.commissionRate)}%` : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={agent.isActive ? 'default' : 'secondary'}>
                                            {agent.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/agents/${agent.id}`}>
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>View Staff</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">
                                                    Deactivate Account
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
