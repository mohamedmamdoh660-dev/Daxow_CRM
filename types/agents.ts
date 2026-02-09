import { User } from '@prisma/client';

export type UserRole = 'admin' | 'staff' | 'agent' | 'sub-agent' | 'student';

export interface AgentProfile {
    id: string;
    companyName: string;
    contactPerson: string | null;
    email: string | null;
    phone: string | null;
    commissionRate: number | null; // Cast Decimal to number
    country: string | null;
    city: string | null;
    address: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    users?: User[];
}

export interface AgentUser extends Omit<User, 'password'> {
    agencyId: string | null;
    commissionRate: number | null;
    agency?: AgentProfile | null;
}

export interface CreateAgentDTO {
    companyName: string;
    email: string; // for the Agent Profile
    contactPerson?: string;
    phone?: string;
    country?: string;
    city?: string;
    // Owner User Details
    ownerEmail: string;
    ownerName: string;
    ownerPassword?: string; // Optional if auto-generated
}

export interface CreateSubAgentDTO {
    email: string;
    name: string;
    password?: string;
    phone?: string;
    commissionRate?: number;
    agencyId: string; // Must be linked to an existing agency
}
