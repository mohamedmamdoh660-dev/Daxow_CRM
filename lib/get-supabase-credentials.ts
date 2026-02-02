import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

interface SupabaseCredentials {
    projectUrl: string;
    serviceRoleKey: string;
}

/**
 * Get Supabase credentials from Settings database
 * Returns the decrypted credentials or null if not configured
 */
export async function getSupabaseCredentials(): Promise<SupabaseCredentials | null> {
    try {
        // Find Supabase credential from Settings
        const settings = await prisma.setting.findMany({
            where: {
                category: 'credentials',
            },
        });

        // Find the Supabase credential
        const supabaseSetting = settings.find((s: any) => {
            const value = s.value as any;
            return value?.provider === 'supabase';
        });

        if (!supabaseSetting) {
            console.warn('Supabase credentials not found in Settings');
            return null;
        }

        const settingValue = supabaseSetting.value as any;
        const encryptedCredentials = settingValue.encryptedCredentials;

        if (!encryptedCredentials) {
            console.error('Encrypted credentials missing');
            return null;
        }

        // Decrypt the credentials
        const decryptedString = decrypt(encryptedCredentials);
        const credentials = JSON.parse(decryptedString);

        // Support both old and new field names
        const projectUrl = credentials.projectUrl || credentials.url;
        const serviceRoleKey = credentials.serviceRoleKey || credentials.serviceKey;

        if (!projectUrl || !serviceRoleKey) {
            console.error('Invalid Supabase credentials format');
            return null;
        }

        return {
            projectUrl,
            serviceRoleKey,
        };
    } catch (error) {
        console.error('Error fetching Supabase credentials:', error);
        return null;
    }
}

/**
 * Get Supabase credentials with fallback to environment variables
 */
export async function getSupabaseCredentialsWithFallback(): Promise<SupabaseCredentials | null> {
    // Try to get from Settings first
    const credentials = await getSupabaseCredentials();

    if (credentials) {
        return credentials;
    }

    // Fallback to environment variables
    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (envUrl && envKey) {
        console.warn('Using Supabase credentials from environment variables (fallback)');
        return {
            projectUrl: envUrl,
            serviceRoleKey: envKey,
        };
    }

    return null;
}
