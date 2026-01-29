'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LeadsRowActionsProps {
    lead: any;
    onRefresh: () => void;
}

export function LeadsRowActions({
    lead,
    onRefresh,
}: LeadsRowActionsProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(
                `http://localhost:3001/api/leads/${lead.id}`,
                {
                    method: 'DELETE',
                    headers: { 'x-performed-by': 'Admin User' }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete lead');
            }

            toast.success('Lead deleted successfully');
            setShowDeleteDialog(false);
            onRefresh();
        } catch (error) {
            console.error('Error deleting lead:', error);
            toast.error('Failed to delete lead');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleActive = async () => {
        try {
            const response = await fetch(
                `http://localhost:3001/api/leads/${lead.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-performed-by': 'Admin User'
                    },
                    body: JSON.stringify({ isActive: !lead.isActive }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update lead');
            }

            toast.success(
                `Lead ${lead.isActive ? 'deactivated' : 'activated'} successfully`
            );
            onRefresh();
        } catch (error) {
            console.error('Error updating lead:', error);
            toast.error('Failed to update lead');
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={`/leads/${lead.id}`} className="flex items-center cursor-pointer">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/leads/${lead.id}/edit`} className="flex items-center cursor-pointer">
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleActive}>
                        {lead.isActive ? (
                            <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Deactivate
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                            </>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the lead.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
