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
import { Calendar } from 'lucide-react';

interface AddTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    // Polymorphic entity support
    entityType?: 'Lead' | 'Student' | 'Application';
    entityId?: string;
    entityName?: string;

    // Legacy (deprecated)
    leadName?: string;

    onTaskAdded?: (task: any) => void;
}

export function AddTaskDialog({
    open,
    onOpenChange,
    entityType,
    entityId,
    entityName,
    leadName, // legacy
    onTaskAdded,
}: AddTaskDialogProps) {
    const [taskType, setTaskType] = useState<string>('');
    const [taskDate, setTaskDate] = useState<string>('');
    const [taskTime, setTaskTime] = useState<string>('');
    const [taskNotes, setTaskNotes] = useState<string>('');
    const [expectedOutcome, setExpectedOutcome] = useState<string>('');

    const handleSubmit = async () => {
        const taskData = {
            title: taskType,
            description: taskNotes,
            dueDate: taskDate && taskTime ? `${taskDate}T${taskTime}:00.000Z` : undefined,
            priority: 'Medium',
            status: 'Open',
            entityType: entityType,
            entityId: entityId,
            metadata: {
                taskType,
                expectedOutcome,
                scheduledDate: taskDate,
                scheduledTime: taskTime,
            },
        };

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                throw new Error('Failed to create task');
            }

            const newTask = await response.json();

            alert(`Task created: ${taskType} scheduled for ${taskDate} at ${taskTime}`);

            if (onTaskAdded) {
                onTaskAdded(newTask);
            }

            // Reset form
            setTaskType('');
            setTaskDate('');
            setTaskTime('');
            setTaskNotes('');
            setExpectedOutcome('');

            onOpenChange(false);
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Failed to create task. Please try again.');
        }
    };

    const isFormValid = taskType && taskDate && taskTime;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                        Schedule a task for {entityName || leadName || 'this entity'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Task Type */}
                    <div className="space-y-2">
                        <Label htmlFor="task-type">Task Type *</Label>
                        <Select value={taskType} onValueChange={setTaskType}>
                            <SelectTrigger id="task-type">
                                <SelectValue placeholder="Select task type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="call">📞 Phone Call</SelectItem>
                                <SelectItem value="email">📧 Send Email</SelectItem>
                                <SelectItem value="meeting">🤝 Meeting</SelectItem>
                                <SelectItem value="follow_up">🔄 Follow Up</SelectItem>
                                <SelectItem value="document_review">📄 Document Review</SelectItem>
                                <SelectItem value="application_submit">📝 Submit Application</SelectItem>
                                <SelectItem value="visit">🏢 Office Visit</SelectItem>
                                <SelectItem value="other">📌 Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="task-date">Date *</Label>
                            <input
                                id="task-date"
                                type="date"
                                value={taskDate}
                                onChange={(e) => setTaskDate(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="task-time">Time *</Label>
                            <input
                                id="task-time"
                                type="time"
                                value={taskTime}
                                onChange={(e) => setTaskTime(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>

                    {/* Expected Outcome */}
                    <div className="space-y-2">
                        <Label htmlFor="expected-outcome">Expected Outcome</Label>
                        <Select value={expectedOutcome} onValueChange={setExpectedOutcome}>
                            <SelectTrigger id="expected-outcome">
                                <SelectValue placeholder="What do you expect to achieve?" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="get_documents">Get missing documents</SelectItem>
                                <SelectItem value="confirm_interest">Confirm interest in program</SelectItem>
                                <SelectItem value="schedule_meeting">Schedule next meeting</SelectItem>
                                <SelectItem value="answer_questions">Answer questions</SelectItem>
                                <SelectItem value="close_deal">Close the deal</SelectItem>
                                <SelectItem value="follow_up_required">Determine if follow-up needed</SelectItem>
                                <SelectItem value="gather_info">Gather more information</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="task-notes">Notes</Label>
                        <Textarea
                            id="task-notes"
                            placeholder="Add any additional notes or details about this task..."
                            value={taskNotes}
                            onChange={(e) => setTaskNotes(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!isFormValid}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Create Task
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
