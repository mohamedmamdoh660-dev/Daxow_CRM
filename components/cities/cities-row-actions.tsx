'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
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
import { CityDialog } from './city-dialog';

interface CitiesRowActionsProps {
    city: any;
    onRefresh: () => void;
}

export function CitiesRowActions({
    city,
    onRefresh,
}: CitiesRowActionsProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(
                `http://localhost:3001/api/cities/${city.id}`,
                {
                    method: 'DELETE',
                    headers: { 'x-performed-by': 'Admin User' }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete city');
            }

            toast.success('City deleted successfully');
            setShowDeleteDialog(false);
            onRefresh();
        } catch (error) {
            console.error('Error deleting city:', error);
            toast.error('Failed to delete city');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleActive = async () => {
        try {
            const response = await fetch(
                `http://localhost:3001/api/cities/${city.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-performed-by': 'Admin User'
                    },
                    body: JSON.stringify({ isActive: !city.isActive }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update city');
            }

            toast.success(
                `City ${city.isActive ? 'deactivated' : 'activated'} successfully`
            );
            onRefresh();
        } catch (error) {
            console.error('Error updating city:', error);
            toast.error('Failed to update city');
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
                        <Link href={`/cities/${city.id}`} className="flex items-center cursor-pointer">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleActive}>
                        {city.isActive ? 'Deactivate' : 'Activate'}
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

            <CityDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                city={city}
                onSuccess={onRefresh}
            />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the city "{city.name}".
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
