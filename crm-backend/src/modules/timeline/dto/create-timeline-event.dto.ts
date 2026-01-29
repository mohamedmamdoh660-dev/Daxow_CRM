import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateTimelineEventDto {
    @IsString()
    entityType: string;

    @IsString()
    entityId: string;

    @IsString()
    eventType: string;

    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsOptional()
    @IsObject()
    metadata?: any;

    @IsOptional()
    @IsString()
    performedBy?: string;
}
