/**
 * Centralized backend configuration.
 * All API proxy routes should import BACKEND_URL from here.
 * Do NOT define BACKEND_URL inline in individual route files.
 */
export const BACKEND_URL =
    process.env.INTERNAL_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:3001';
