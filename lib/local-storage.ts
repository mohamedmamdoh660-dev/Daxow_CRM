import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Local file storage fallback for when Supabase is not configured
 * Files are stored in /public/uploads/ directory
 */

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir(subPath: string = ''): Promise<string> {
    const fullPath = path.join(UPLOAD_DIR, subPath);

    if (!existsSync(fullPath)) {
        await mkdir(fullPath, { recursive: true });
    }

    return fullPath;
}

/**
 * Generate unique filename
 */
function generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_');

    return `${timestamp}_${randomStr}_${baseName}${ext}`;
}

/**
 * Upload file to local storage
 */
export async function uploadToLocal(
    file: File,
    folder: string = 'temp'
): Promise<{ url: string; path: string }> {
    try {
        // Ensure directory exists
        const uploadPath = await ensureUploadDir(folder);

        // Generate unique filename
        const filename = generateUniqueFilename(file.name);
        const filePath = path.join(uploadPath, filename);

        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Write file to disk
        await writeFile(filePath, buffer);

        // Generate public URL (relative to /public)
        const publicUrl = `/uploads/${folder}/${filename}`;

        return {
            url: publicUrl,
            path: `${folder}/${filename}`,
        };
    } catch (error) {
        console.error('Error uploading to local storage:', error);
        throw new Error('Failed to upload file to local storage');
    }
}

/**
 * Generate storage path for organized file structure
 */
export function generateLocalPath(
    folder: string,
    filename: string,
    prefix?: string
): string {
    const uniqueName = generateUniqueFilename(filename);

    if (prefix) {
        return `${folder}/${prefix}_${uniqueName}`;
    }

    return `${folder}/${uniqueName}`;
}
