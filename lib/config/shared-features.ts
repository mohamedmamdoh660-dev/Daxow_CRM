/**
 * Global Shared Features Configuration
 * 
 * This file defines which features are available across all modules.
 * Any feature added here will be automatically available in all entity types.
 */

export type EntityType = 'Lead' | 'Student' | 'Application' | 'University' | 'Agent';

export interface SharedFeature {
    id: string;
    name: string;
    description: string;
    component?: string;
    apiEndpoint?: string;
    enabled: boolean;
    availableIn: EntityType[];
}

/**
 * Global Shared Features
 * These features are available across multiple entity types
 */
export const SHARED_FEATURES: Record<string, SharedFeature> = {
    // Tasks - Available in all modules
    tasks: {
        id: 'tasks',
        name: 'Tasks',
        description: 'Task management with assignments and due dates',
        component: 'TasksTab',
        apiEndpoint: '/api/tasks',
        enabled: true,
        availableIn: ['Lead', 'Student', 'Application', 'University', 'Agent'],
    },

    // Timeline - Available in all modules
    timeline: {
        id: 'timeline',
        name: 'Timeline',
        description: 'Activity history and audit trail',
        component: 'TimelineTab',
        apiEndpoint: '/api/timeline',
        enabled: true,
        availableIn: ['Lead', 'Student', 'Application', 'University', 'Agent'],
    },

    // Documents - Available in most modules
    documents: {
        id: 'documents',
        name: 'Documents',
        description: 'File uploads and document management',
        component: 'DocumentsTab',
        apiEndpoint: '/api/documents',
        enabled: true,
        availableIn: ['Lead', 'Student', 'Application'],
    },

    // Emails - Available in person-related modules
    emails: {
        id: 'emails',
        name: 'Emails',
        description: 'Email communication history',
        component: 'EmailsTab',
        apiEndpoint: '/api/emails',
        enabled: true,
        availableIn: ['Lead', 'Student', 'Agent'],
    },

    // Notes - Available everywhere
    notes: {
        id: 'notes',
        name: 'Notes',
        description: 'Internal notes and comments',
        component: 'NotesTab',
        apiEndpoint: '/api/notes',
        enabled: true,
        availableIn: ['Lead', 'Student', 'Application', 'University', 'Agent'],
    },

    // Notifications - System-wide
    notifications: {
        id: 'notifications',
        name: 'Notifications',
        description: 'Real-time alerts and reminders',
        component: 'NotificationBell',
        apiEndpoint: '/api/notifications',
        enabled: false, // Will be enabled in future phase
        availableIn: ['Lead', 'Student', 'Application', 'University', 'Agent'],
    },
};

/**
 * Timeline Event Types
 * These events are automatically tracked in the timeline
 */
export const TIMELINE_EVENT_TYPES = {
    // Entity Events
    ENTITY_CREATED: 'entity_created',
    ENTITY_UPDATED: 'entity_updated',
    ENTITY_DELETED: 'entity_deleted',
    STATUS_CHANGED: 'status_changed',

    // Task Events
    TASK_CREATED: 'task_created',
    TASK_UPDATED: 'task_updated',
    TASK_COMPLETED: 'task_completed',
    TASK_DELETED: 'task_deleted',

    // Email Events
    EMAIL_SENT: 'email_sent',
    EMAIL_OPENED: 'email_opened',
    EMAIL_REPLIED: 'email_replied',

    // Document Events
    DOCUMENT_UPLOADED: 'document_uploaded',
    DOCUMENT_VIEWED: 'document_viewed',
    DOCUMENT_DELETED: 'document_deleted',

    // Note Events
    NOTE_ADDED: 'note_added',
    NOTE_UPDATED: 'note_updated',

    // Application Events
    APPLICATION_SUBMITTED: 'application_submitted',
    APPLICATION_APPROVED: 'application_approved',
    APPLICATION_REJECTED: 'application_rejected',

    // Communication Events
    CALL_LOGGED: 'call_logged',
    MEETING_SCHEDULED: 'meeting_scheduled',

    // Assignment Events
    ASSIGNED_TO_USER: 'assigned_to_user',
    REASSIGNED: 'reassigned',
} as const;

/**
 * Get features available for a specific entity type
 */
export function getAvailableFeatures(entityType: EntityType): SharedFeature[] {
    return Object.values(SHARED_FEATURES).filter(
        (feature) => feature.enabled && feature.availableIn.includes(entityType)
    );
}

/**
 * Check if a feature is available for an entity type
 */
export function isFeatureAvailable(featureId: string, entityType: EntityType): boolean {
    const feature = SHARED_FEATURES[featureId];
    return feature ? feature.enabled && feature.availableIn.includes(entityType) : false;
}

/**
 * Get tab configuration for entity detail pages
 */
export function getEntityTabs(entityType: EntityType) {
    const features = getAvailableFeatures(entityType);

    // Base tabs (always present)
    const baseTabs = [
        { id: 'overview', label: 'Overview', icon: 'FileText' },
    ];

    // Feature-based tabs
    const featureTabs = features.map(feature => ({
        id: feature.id,
        label: feature.name,
        icon: getFeatureIcon(feature.id),
        component: feature.component,
    }));

    return [...baseTabs, ...featureTabs];
}

/**
 * Get icon for feature
 */
function getFeatureIcon(featureId: string): string {
    const iconMap: Record<string, string> = {
        tasks: 'CheckSquare',
        timeline: 'Clock',
        documents: 'FileText',
        emails: 'Mail',
        notes: 'StickyNote',
        notifications: 'Bell',
    };
    return iconMap[featureId] || 'Circle';
}

/**
 * Module-specific overrides
 * Use this to customize features per module if needed
 */
export const MODULE_OVERRIDES: Partial<Record<EntityType, Partial<typeof SHARED_FEATURES>>> = {
    // Example: Disable certain features for specific modules
    // University: {
    //   emails: { ...SHARED_FEATURES.emails, enabled: false },
    // },
};
