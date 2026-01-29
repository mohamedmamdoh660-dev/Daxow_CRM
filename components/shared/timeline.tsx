'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
    Circle,
    CheckCircle2,
    Clock,
    User,
    AlertCircle,
    FileEdit,
    Plus,
    Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface TimelineEvent {
    id: string;
    eventType: string;
    title: string;
    description: string;
    createdAt: string;
    metadata: any;
    performedBy?: string;
}

interface TimelineProps {
    entityType: string;
    entityId: string;
}

export function Timeline({ entityType, entityId }: TimelineProps) {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3001/api/timeline/${entityType}/${entityId}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setEvents(data);
                }
            } catch (error) {
                console.error('Error fetching timeline:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (entityType && entityId) {
            fetchTimeline();
        }
    }, [entityType, entityId]);

    const getEventIcon = (eventType: string) => {
        switch (eventType) {
            case 'Created':
                return <Plus className="h-4 w-4 text-green-500" />;
            case 'Updated':
                return <FileEdit className="h-4 w-4 text-blue-500" />;
            case 'Deleted':
                return <Trash2 className="h-4 w-4 text-red-500" />;
            default:
                return <Circle className="h-4 w-4 text-gray-500" />;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground text-sm">
                No history available.
            </div>
        );
    }

    return (
        <div className="relative space-y-0">
            {events.map((event, index) => (
                <div key={event.id} className="flex gap-4 pb-8 last:pb-0 relative">
                    {/* Vertical Line */}
                    {index !== events.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-px bg-border -ml-px" />
                    )}

                    {/* Icon */}
                    <div className="relative z-10">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm">
                            {getEventIcon(event.eventType)}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1 pt-1">
                        <div className="flex items-center justify-between text-sm">
                            <p className="font-medium">{event.title}</p>
                            <span className="text-xs text-muted-foreground">
                                {format(new Date(event.createdAt), 'MMM d, yyyy h:mm a')}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {event.description}
                        </p>
                        {event.performedBy && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <User className="h-3 w-3" />
                                <span>{event.performedBy}</span>
                            </div>
                        )}

                        {/* Show Changes if available */}
                        {event.eventType === 'Updated' && event.metadata?.changes && (
                            <div className="mt-2 space-y-1">
                                {Object.entries(event.metadata.changes).map(([key, value]: [string, any]) => (
                                    <div key={key} className="text-sm">
                                        <span className="text-muted-foreground">Changed </span>
                                        <span className="font-medium text-foreground">{key}</span>
                                        <span className="text-muted-foreground"> from </span>
                                        <code className="bg-muted px-1 py-0.5 rounded text-xs">{String(value.from)}</code>
                                        <span className="text-muted-foreground"> to </span>
                                        <code className="bg-muted px-1 py-0.5 rounded text-xs">{String(value.to)}</code>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
