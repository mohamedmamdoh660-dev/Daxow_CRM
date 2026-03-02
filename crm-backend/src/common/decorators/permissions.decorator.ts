import { SetMetadata } from '@nestjs/common';

export interface PermissionRequirements {
    module: string;
    action: string;
}

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: PermissionRequirements[]) => SetMetadata(PERMISSIONS_KEY, permissions);
