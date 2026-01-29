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
import { LanguageFormDialog } from './language-form-dialog';

interface LanguagesRowActionsProps {
    language: any;
    onRefresh: () => void;
}

export function LanguagesRowActions({
    language,
    onRefresh,
}: LanguagesRowActionsProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(
                `http://localhost:3001/api/languages/${language.id}`,
                { method: 'DELETE' }
            );

            if (!response.ok) {
                throw new Error('Failed to delete language');
            }

            toast.success('Language deleted successfully');
            setShowDeleteDialog(false);
            onRefresh();
        } catch (error) {
            console.error('Error deleting language:', error);
            toast.error('Failed to delete language');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleActive = async () => {
        try {
            const response = await fetch(
                `http://localhost:3001/api/languages/${language.id}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isActive: !language.isActive }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update language');
            }

            toast.success(
                `Language ${language.isActive ? 'deactivated' : 'activated'} successfully`
            );
            onRefresh();
        } catch (error) {
            console.error('Error updating language:', error);
            toast.error('Failed to update language');
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
                        <span className={language.isActive ? 'text-amber-600' : 'text-green-600'}>
                            {language.isActive ? 'Deactivate' : 'Activate'}
                        </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <LanguageFormDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                onSuccess={onRefresh}
                languageToEdit={language}
            />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the language "{language.name}".
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
