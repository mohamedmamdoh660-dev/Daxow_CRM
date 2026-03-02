import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateApplicationDto {
    @IsString()
    studentId: string;

    @IsString()
    programId: string;

    @IsString()
    academicYearId: string;

    @IsString()
    semesterId: string;

    @IsString()
    degreeId: string;

    @IsString()
    @IsOptional()
    applicationName?: string;

    @IsString()
    @IsOptional()
    agentId?: string;

    @IsString()
    @IsOptional()
    agencyId?: string;

    @IsEnum(['Draft', 'Submitted', 'Under Review', 'Conditional Acceptance', 'Final Acceptance', 'Rejected', 'Enrolled', 'Cancelled'])
    @IsOptional()
    stage?: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsString()
    @IsOptional()
    ownerId?: string;  // User ID (Direct) or Agent ID (Agent)

    @IsString()
    @IsOptional()
    ownerType?: string;  // 'Direct' | 'Agent'

    @IsOptional()
    metadata?: any;
}
