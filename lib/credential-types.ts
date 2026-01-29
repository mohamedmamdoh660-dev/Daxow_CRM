import { Database, Mail, MessageSquare, Code } from 'lucide-react';

export interface CredentialField {
    name: string;
    label: string;
    type: 'text' | 'password' | 'number' | 'email' | 'url';
    placeholder?: string;
    required: boolean;
    validation?: string;
}

export interface CredentialProvider {
    id: string;
    name: string;
    category: 'database' | 'storage' | 'email' | 'api' | 'other';
    icon: any;
    description?: string;
    fields: CredentialField[];
}

export const CREDENTIAL_PROVIDERS: CredentialProvider[] = [
    {
        id: 'supabase',
        name: 'Supabase',
        category: 'database',
        icon: Database,
        description: 'Supabase Database and Storage',
        fields: [
            {
                name: 'url',
                label: 'Project URL',
                type: 'url',
                placeholder: 'https://your-project.supabase.co',
                required: true,
            },
            {
                name: 'serviceKey',
                label: 'Service Role Key',
                type: 'password',
                placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                required: true,
            },
        ],
    },
    {
        id: 'postgresql',
        name: 'PostgreSQL',
        category: 'database',
        icon: Database,
        description: 'PostgreSQL Database',
        fields: [
            {
                name: 'host',
                label: 'Host',
                type: 'text',
                placeholder: 'localhost',
                required: true,
            },
            {
                name: 'port',
                label: 'Port',
                type: 'number',
                placeholder: '5432',
                required: true,
            },
            {
                name: 'database',
                label: 'Database',
                type: 'text',
                placeholder: 'mydb',
                required: true,
            },
            {
                name: 'username',
                label: 'Username',
                type: 'text',
                placeholder: 'postgres',
                required: true,
            },
            {
                name: 'password',
                label: 'Password',
                type: 'password',
                required: true,
            },
        ],
    },
    {
        id: 'smtp',
        name: 'SMTP Email',
        category: 'email',
        icon: Mail,
        description: 'SMTP Email Server',
        fields: [
            {
                name: 'host',
                label: 'SMTP Host',
                type: 'text',
                placeholder: 'smtp.gmail.com',
                required: true,
            },
            {
                name: 'port',
                label: 'Port',
                type: 'number',
                placeholder: '587',
                required: true,
            },
            {
                name: 'username',
                label: 'Username/Email',
                type: 'email',
                placeholder: 'your@email.com',
                required: true,
            },
            {
                name: 'password',
                label: 'Password',
                type: 'password',
                required: true,
            },
        ],
    },
    {
        id: 'api_key',
        name: 'API Key',
        category: 'api',
        icon: Code,
        description: 'Generic API Key',
        fields: [
            {
                name: 'name',
                label: 'Service Name',
                type: 'text',
                placeholder: 'My API Service',
                required: true,
            },
            {
                name: 'apiKey',
                label: 'API Key',
                type: 'password',
                placeholder: 'sk-...',
                required: true,
            },
            {
                name: 'apiUrl',
                label: 'API URL (Optional)',
                type: 'url',
                placeholder: 'https://api.example.com',
                required: false,
            },
        ],
    },
];

export interface StoredCredential {
    id: string;
    provider: string;
    name: string;
    credentials: Record<string, string>; // Decrypted for display
    tag?: 'personal' | 'shared' | 'team';
    lastUsed?: Date;
    createdAt: Date;
    updatedAt: Date;
}
