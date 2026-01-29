import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateTaskDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    // Polymorphic fields
    @IsOptional()
    @IsEnum(['Lead', 'Student', 'Application'])
    entityType?: string;

    @IsOptional()
    @IsString()
    entityId?: string;

    // Legacy support
    @IsOptional()
    @IsString()
    applicationId?: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsEnum(['Low', 'Medium', 'High'])
    priority?: string;

    @IsOptional()
    @IsEnum(['Open', 'In Progress', 'Completed', 'Cancelled'])
    status?: string;

    @IsOptional()
    @IsString()
    assignedTo?: string;

    @IsOptional()
    @IsString()
    createdBy?: string;

    @IsOptional()
    metadata?: any;
}
