'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trash2, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface TaskViewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: any;
    onTaskUpdated?: () => void;
    onTaskDeleted?: () => void;
}

interface CompleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: (outcome: 'success' | 'failed', notes: string) => void;
}

function CompleteTaskDialog({ open, onOpenChange, onComplete }: CompleteDialogProps) {
    const [outcome, setOutcome] = useState<'success' | 'failed'>('success');
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
        onComplete(outcome, notes);
        setNotes('');
        setOutcome('success');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Complete Task</DialogTitle>
                    <DialogDescription>
                        Mark this task as complete
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Outcome</Label>
                        <Select value={outcome} onValueChange={(val) => setOutcome(val as 'success' | 'failed')}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="success">✅ Success</SelectItem>
                                <SelectItem value="failed">❌ Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Notes (Optional)</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes about this task completion..."
                            rows={4}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        Complete Task
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function TaskViewDialog({
    open,
    onOpenChange,
    task,
    onTaskUpdated,
    onTaskDeleted,
}: TaskViewDialogProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [status, setStatus] = useState(task?.status || 'Open');
    const [description, setDescription] = useState(task?.description || task?.metadata?.notes || '');
    const [priority, setPriority] = useState(task?.priority || 'Medium');
    const [taskDate, setTaskDate] = useState(task?.metadata?.scheduledDate || '');
    const [taskTime, setTaskTime] = useState(task?.metadata?.scheduledTime || '');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);

    if (!task) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const dueDate = taskDate && taskTime ? `${taskDate}T${taskTime}:00.000Z` : undefined;

            const response = await fetch(`/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status,
                    description,
                    priority,
                    dueDate,
                    metadata: {
                        ...task.metadata,
                        scheduledDate: taskDate,
                        scheduledTime: taskTime,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            alert('Task updated successfully!');
            setIsEditing(false);
            if (onTaskUpdated) {
                onTaskUpdated();
            }
            onOpenChange(false);
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }

            alert('Task deleted successfully!');
            if (onTaskDeleted) {
                onTaskDeleted();
            }
            onOpenChange(false);
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete task. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCompleteTask = async (outcome: 'success' | 'failed', notes: string) => {
        setShowCompleteDialog(false);
        setIsSaving(true);

        try {
            const payload = {
                status: outcome === 'success' ? 'Completed' : 'Cancelled',
                metadata: {
                    ...task.metadata,
                    outcome: outcome,
                    completionNotes: notes,
                    completedAt: new Date().toISOString(),
                },
            };

            console.log('Completing task:', task.id, 'with payload:', payload);

            const response = await fetch(`/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json();
            console.log('Response:', response.status, responseData);

            if (!response.ok) {
                const errorMessage = responseData.message || responseData.error || 'Failed to complete task';
                throw new Error(`${response.status}: ${errorMessage}`);
            }

            const message = outcome === 'success'
                ? '✅ Task marked as completed successfully!'
                : '❌ Task marked as failed.';

            alert(message);
            setStatus(outcome === 'success' ? 'Completed' : 'Cancelled');

            if (onTaskUpdated) {
                onTaskUpdated();
            }
            onOpenChange(false);
        } catch (error) {
            console.error('Error completing task:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            alert(`Failed to complete task: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    const taskTitle = task.title || task.metadata?.taskType || 'Untitled Task';
    const taskDateDisplay = task.dueDate
        ? new Date(task.dueDate).toLocaleString()
        : `${task.metadata?.scheduledDate || ''} ${task.metadata?.scheduledTime || ''}`;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <DialogTitle className="text-2xl capitalize">{taskTitle}</DialogTitle>
                                <DialogDescription className="mt-2 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {taskDateDisplay}
                                </DialogDescription>
                            </div>
                            <Badge
                                variant={status === 'Completed' ? 'default' : 'secondary'}
                                className="ml-2"
                            >
                                {status}
                            </Badge>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Status */}
                        <div className="space-y-2">
                            <Label>Status</Label>
                            {isEditing ? (
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Open">Open</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="text-sm text-muted-foreground">{status}</p>
                            )}
                        </div>

                        {/* Date and Time (Editable) */}
                        {isEditing && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-task-date">Date</Label>
                                    <input
                                        id="edit-task-date"
                                        type="date"
                                        value={taskDate}
                                        onChange={(e) => setTaskDate(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-task-time">Time</Label>
                                    <input
                                        id="edit-task-time"
                                        type="time"
                                        value={taskTime}
                                        onChange={(e) => setTaskTime(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Priority */}
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            {isEditing ? (
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Badge variant="outline">{priority}</Badge>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label>Description / Notes</Label>
                            {isEditing ? (
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Add notes or description..."
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {description || 'No description'}
                                </p>
                            )}
                        </div>

                        {/* Metadata */}
                        {task.metadata?.expectedOutcome && (
                            <div className="space-y-2">
                                <Label>Expected Outcome</Label>
                                <p className="text-sm text-muted-foreground capitalize">
                                    {task.metadata.expectedOutcome.replace(/_/g, ' ')}
                                </p>
                            </div>
                        )}

                        {/* Outcome (if completed) */}
                        {task.metadata?.outcome && (
                            <div className="space-y-2">
                                <Label>Result</Label>
                                <Badge variant={task.metadata.outcome === 'success' ? 'default' : 'destructive'}>
                                    {task.metadata.outcome === 'success' ? '✅ Success' : '❌ Failed'}
                                </Badge>
                                {task.metadata.completionNotes && (
                                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                                        {task.metadata.completionNotes}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <Label className="text-xs text-muted-foreground">Created</Label>
                                <p className="text-sm">
                                    {new Date(task.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Updated</Label>
                                <p className="text-sm">
                                    {new Date(task.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex items-center justify-between gap-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isDeleting || isSaving}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>

                        <div className="flex gap-2">
                            {!isEditing && status !== 'Completed' && status !== 'Cancelled' && (
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCompleteDialog(true)}
                                    disabled={isSaving}
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Mark Complete
                                </Button>
                            )}

                            {isEditing ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setStatus(task.status);
                                            setDescription(task.description || task.metadata?.notes || '');
                                            setPriority(task.priority);
                                            setTaskDate(task.metadata?.scheduledDate || '');
                                            setTaskTime(task.metadata?.scheduledTime || '');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        Save Changes
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={() => setIsEditing(true)}>
                                    Edit Task
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Complete Task Dialog */}
            <CompleteTaskDialog
                open={showCompleteDialog}
                onOpenChange={setShowCompleteDialog}
                onComplete={handleCompleteTask}
            />
        </>
    );
}
