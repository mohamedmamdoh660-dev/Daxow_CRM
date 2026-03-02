import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PermissionDto {
    @ApiProperty({ example: 'Students' })
    @IsString()
    module: string;

    @ApiProperty({ example: 'view', enum: ['view', 'add', 'edit', 'delete', 'export', 'import'] })
    @IsString()
    action: string;
}

export class CreateRoleDto {
    @ApiProperty({ example: 'Data Entry Manager' })
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ type: [PermissionDto], required: false })
    @IsOptional()
    @IsArray()
    permissions?: PermissionDto[];
}

export class UpdateRoleDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ type: [PermissionDto], required: false })
    @IsOptional()
    @IsArray()
    permissions?: PermissionDto[];
}
