'use client';

import { useState } from 'react';
import { systemModules, getActiveModules } from '@/lib/settings/modules';
import { getModuleStatuses, addStatus, updateStatus, deleteStatus } from '@/lib/settings/statuses';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';

export function StatusManager() {
    const [selectedModule, setSelectedModule] = useState('leads');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newStatusLabel, setNewStatusLabel] = useState('');
    const [newStatusColor, setNewStatusColor] = useState('#3b82f6');

    const activeModules = getActiveModules().filter(m => m.hasStatus);
    const statuses = getModuleStatuses(selectedModule);

    const handleAddStatus = () => {
        if (newStatusLabel.trim()) {
            addStatus(selectedModule, newStatusLabel, newStatusColor);
            setNewStatusLabel('');
            setNewStatusColor('#3b82f6');
            setIsAddDialogOpen(false);
        }
    };

    const handleDeleteStatus = (statusId: string) => {
        if (confirm('Are you sure you want to delete this status?')) {
            deleteStatus(statusId);
        }
    };

    const selectedModuleData = systemModules.find(m => m.id === selectedModule);
    const ModuleIcon = selectedModuleData?.icon;

    const predefinedColors = [
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Purple', value: '#8b5cf6' },
        { name: 'Green', value: '#10b981' },
        { name: 'Yellow', value: '#f59e0b' },
        { name: 'Red', value: '#ef4444' },
        { name: 'Gray', value: '#6b7280' },
        { name: 'Cyan', value: '#06b6d4' },
        { name: 'Pink', value: '#ec4899' },
    ];

    return (
        <div className="space-y-6">
            {/* Module Selector */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Label>Select Module</Label>
                    <Select value={selectedModule} onValueChange={setSelectedModule}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {activeModules.map((module) => {
                                const Icon = module.icon;
                                return (
                                    <SelectItem key={module.id} value={module.id}>
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-4 w-4" style={{ color: module.color }} />
                                            {module.name}
                                        </div>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>

                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Status
                </Button>
            </div>

            {/* Status List */}
            <div className="space-y-3">
                {statuses.length > 0 ? (
                    statuses.map((status) => (
                        <div
                            key={status.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-4 h-4 rounded-full border-2"
                                    style={{ borderColor: status.color, backgroundColor: `${status.color}20` }}
                                />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{status.label}</span>
                                        {status.isDefault && (
                                            <Badge variant="secondary" className="text-xs">
                                                <Star className="h-3 w-3 mr-1 fill-current" />
                                                Default
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Order: {status.order}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge style={{ backgroundColor: status.color, color: 'white' }}>
                                    {status.label}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteStatus(status.id)}
                                    disabled={status.isDefault}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">
                            No statuses configured for this module
                        </p>
                    </div>
                )}
            </div>

            {/* Add Status Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Status</DialogTitle>
                        <DialogDescription>
                            Create a new status for{' '}
                            <span className="font-semibold">{selectedModuleData?.name}</span> module
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="status-label">Status Name</Label>
                            <Input
                                id="status-label"
                                value={newStatusLabel}
                                onChange={(e) => setNewStatusLabel(e.target.value)}
                                placeholder="e.g., In Progress"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Status Color</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {predefinedColors.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        className={`h-10 rounded-md border-2 transition-all ${newStatusColor === color.value
                                                ? 'ring-2 ring-offset-2 ring-primary'
                                                : ''
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                        onClick={() => setNewStatusColor(color.value)}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <Label>Preview</Label>
                            <div className="mt-2">
                                <Badge style={{ backgroundColor: newStatusColor, color: 'white' }}>
                                    {newStatusLabel || 'Status Name'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddStatus} disabled={!newStatusLabel.trim()}>
                            Add Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
