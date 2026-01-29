import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseCredentialsWithFallback } from './get-supabase-credentials';

/**
 * Get a Supabase client with credentials from Settings or environment
 */
async function getSupabaseClient(): Promise<SupabaseClient | null> {
    const credentials = await getSupabaseCredentialsWithFallback();

    if (!credentials) {
        console.error('Supabase credentials not configured in Settings or environment');
        return null;
    }

    return createClient(credentials.projectUrl, credentials.serviceRoleKey);
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadToSupabase(
    file: File,
    bucket: string,
    path: string
): Promise<{ url: string; path: string } | null> {
    try {
        const supabase = await getSupabaseClient();

        if (!supabase) {
            throw new Error('Supabase not configured. Please add Supabase credentials in Settings → Integration → Credentials');
        }

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                upsert: true,
            });

        if (error) {
            console.error('Supabase upload error:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        return {
            url: publicUrl,
            path: data.path,
        };
    } catch (error: any) {
        console.error('Error uploading to Supabase:', error);
        throw error;
    }
}

/**
 * Get public URL for a file in Supabase Storage
 */
export async function getSupabaseUrl(bucket: string, path: string): Promise<string | null> {
    try {
        const supabase = await getSupabaseClient();

        if (!supabase) {
            return null;
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    } catch (error) {
        console.error('Error getting Supabase URL:', error);
        return null;
    }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFromSupabase(bucket: string, path: string): Promise<boolean> {
    try {
        const supabase = await getSupabaseClient();

        if (!supabase) {
            throw new Error('Supabase not configured');
        }

        const { error } = await supabase.storage.from(bucket).remove([path]);

        if (error) {
            console.error('Supabase delete error:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting from Supabase:', error);
        return false;
    }
}

/**
 * Generate a unique file path for Supabase Storage
 */
export function generateSupabasePath(
    folder: string,
    filename: string,
    prefix?: string
): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');

    if (prefix) {
        return `${folder}/${prefix}_${timestamp}_${randomStr}_${safeName}`;
    }

    return `${folder}/${timestamp}_${randomStr}_${safeName}`;
}
