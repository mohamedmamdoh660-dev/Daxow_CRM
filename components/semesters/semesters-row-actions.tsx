'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
import { EditSemesterDialog } from './edit-semester-dialog';

interface SemestersRowActionsProps {
    semester: any;
    onRefresh: () => void;
}

export function SemestersRowActions({
    semester,
    onRefresh,
}: SemestersRowActionsProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(
                `http://localhost:3001/api/semesters/${semester.id}`,
                {
                    method: 'DELETE',
                    headers: { 'x-performed-by': 'Admin User' }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete semester');
            }

            toast.success('Semester deleted successfully');
            setShowDeleteDialog(false);
            onRefresh();
        } catch (error) {
            console.error('Error deleting semester:', error);
            toast.error('Failed to delete semester');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleActive = async () => {
        try {
            const response = await fetch(
                `http://localhost:3001/api/semesters/${semester.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-performed-by': 'Admin User'
                    },
                    body: JSON.stringify({ isActive: !semester.isActive }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update semester');
            }

            toast.success(
                `Semester ${semester.isActive ? 'deactivated' : 'activated'} successfully`
            );
            onRefresh();
        } catch (error) {
            console.error('Error updating semester:', error);
            toast.error('Failed to update semester');
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
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleActive}>
                        {semester.isActive ? 'Deactivate' : 'Activate'}
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

            <EditSemesterDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                semester={semester}
                onSuccess={onRefresh}
            />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the semester "{semester.name}".
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
