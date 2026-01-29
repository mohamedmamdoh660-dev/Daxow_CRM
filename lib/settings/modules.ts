import {
    UserPlus,
    GraduationCap,
    FileText,
    Building2,
    Users,
    LucideIcon
} from 'lucide-react';

export interface SystemModule {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    color: string;
    isActive: boolean;
    hasStatus: boolean;
    hasCustomFields: boolean;
    hasTasks: boolean;
    hasDocuments: boolean;
    hasNotes: boolean;
    hasTimeline: boolean;
}

export const systemModules: SystemModule[] = [
    {
        id: 'leads',
        name: 'Leads',
        description: 'Manage potential students and inquiries',
        icon: UserPlus,
        color: '#3b82f6',
        isActive: true,
        hasStatus: true,
        hasCustomFields: true,
        hasTasks: true,
        hasDocuments: true,
        hasNotes: true,
        hasTimeline: true,
    },
    {
        id: 'students',
        name: 'Students',
        description: 'Manage enrolled and active students',
        icon: GraduationCap,
        color: '#10b981',
        isActive: true,
        hasStatus: true,
        hasCustomFields: true,
        hasTasks: true,
        hasDocuments: true,
        hasNotes: true,
        hasTimeline: true,
    },
    {
        id: 'applications',
        name: 'Applications',
        description: 'Track university applications and submissions',
        icon: FileText,
        color: '#f59e0b',
        isActive: true,
        hasStatus: true,
        hasCustomFields: true,
        hasTasks: false,
        hasDocuments: true,
        hasNotes: true,
        hasTimeline: true,
    },
    {
        id: 'universities',
        name: 'Universities',
        description: 'Partner universities and programs',
        icon: Building2,
        color: '#8b5cf6',
        isActive: false,
        hasStatus: false,
        hasCustomFields: true,
        hasTasks: false,
        hasDocuments: false,
        hasNotes: true,
        hasTimeline: false,
    },
    {
        id: 'staff',
        name: 'Staff',
        description: 'Team members and counselors',
        icon: Users,
        color: '#ec4899',
        isActive: false,
        hasStatus: false,
        hasCustomFields: true,
        hasTasks: false,
        hasDocuments: false,
        hasNotes: false,
        hasTimeline: false,
    },
];

export const getModule = (moduleId: string): SystemModule | undefined => {
    return systemModules.find(m => m.id === moduleId);
};

export const getActiveModules = (): SystemModule[] => {
    return systemModules.filter(m => m.isActive);
};
