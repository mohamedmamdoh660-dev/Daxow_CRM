export interface StatusConfig {
    id: string;
    moduleId: string;
    label: string;
    color: string;
    icon?: string;
    isDefault: boolean;
    order: number;
    isActive: boolean;
}

// Default statuses for each module
export const defaultStatuses: Record<string, Omit<StatusConfig, 'id' | 'moduleId'>[]> = {
    leads: [
        { label: 'New', color: '#3b82f6', isDefault: true, order: 1, isActive: true },
        { label: 'Contacted', color: '#8b5cf6', isDefault: false, order: 2, isActive: true },
        { label: 'Qualified', color: '#10b981', isDefault: false, order: 3, isActive: true },
        { label: 'Proposal Sent', color: '#f59e0b', isDefault: false, order: 4, isActive: true },
        { label: 'Won', color: '#22c55e', isDefault: false, order: 5, isActive: true },
        { label: 'Lost', color: '#ef4444', isDefault: false, order: 6, isActive: true },
    ],
    students: [
        { label: 'Applicant', color: '#3b82f6', isDefault: true, order: 1, isActive: true },
        { label: 'Document Collection', color: '#8b5cf6', isDefault: false, order: 2, isActive: true },
        { label: 'Application Submitted', color: '#f59e0b', isDefault: false, order: 3, isActive: true },
        { label: 'Enrolled', color: '#10b981', isDefault: false, order: 4, isActive: true },
        { label: 'Active', color: '#22c55e', isDefault: false, order: 5, isActive: true },
        { label: 'Graduated', color: '#06b6d4', isDefault: false, order: 6, isActive: true },
        { label: 'Withdrawn', color: '#ef4444', isDefault: false, order: 7, isActive: true },
    ],
    applications: [
        { label: 'Draft', color: '#94a3b8', isDefault: true, order: 1, isActive: true },
        { label: 'Submitted', color: '#3b82f6', isDefault: false, order: 2, isActive: true },
        { label: 'Under Review', color: '#f59e0b', isDefault: false, order: 3, isActive: true },
        { label: 'Interview Scheduled', color: '#8b5cf6', isDefault: false, order: 4, isActive: true },
        { label: 'Approved', color: '#10b981', isDefault: false, order: 5, isActive: true },
        { label: 'Conditional Offer', color: '#22c55e', isDefault: false, order: 6, isActive: true },
        { label: 'Rejected', color: '#ef4444', isDefault: false, order: 7, isActive: true },
        { label: 'Withdrawn', color: '#64748b', isDefault: false, order: 8, isActive: true },
    ],
};

// Mock data - will be replaced with database
let statuses: StatusConfig[] = [];

// Initialize with default statuses
Object.entries(defaultStatuses).forEach(([moduleId, moduleStatuses]) => {
    moduleStatuses.forEach((status, index) => {
        statuses.push({
            id: `${moduleId}-${index + 1}`,
            moduleId,
            ...status,
        });
    });
});

export const getModuleStatuses = (moduleId: string): StatusConfig[] => {
    return statuses
        .filter(s => s.moduleId === moduleId && s.isActive)
        .sort((a, b) => a.order - b.order);
};

export const getDefaultStatus = (moduleId: string): StatusConfig | undefined => {
    return statuses.find(s => s.moduleId === moduleId && s.isDefault);
};

export const addStatus = (moduleId: string, label: string, color: string): StatusConfig => {
    const moduleStatuses = getModuleStatuses(moduleId);
    const newStatus: StatusConfig = {
        id: `${moduleId}-${Date.now()}`,
        moduleId,
        label,
        color,
        isDefault: false,
        order: moduleStatuses.length + 1,
        isActive: true,
    };
    statuses.push(newStatus);
    return newStatus;
};

export const updateStatus = (id: string, updates: Partial<StatusConfig>): StatusConfig | undefined => {
    const index = statuses.findIndex(s => s.id === id);
    if (index !== -1) {
        statuses[index] = { ...statuses[index], ...updates };
        return statuses[index];
    }
    return undefined;
};

export const deleteStatus = (id: string): boolean => {
    const index = statuses.findIndex(s => s.id === id);
    if (index !== -1) {
        statuses.splice(index, 1);
        return true;
    }
    return false;
};

export const reorderStatuses = (moduleId: string, statusIds: string[]): void => {
    statusIds.forEach((id, index) => {
        const status = statuses.find(s => s.id === id);
        if (status) {
            status.order = index + 1;
        }
    });
};
