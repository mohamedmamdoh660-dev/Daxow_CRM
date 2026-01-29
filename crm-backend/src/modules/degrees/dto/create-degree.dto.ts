import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDegreeDto {
    @ApiProperty({ description: 'Name of the degree' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ description: 'Code of the degree' })
    @IsString()
    @IsOptional()
    code?: string;

    @ApiPropertyOptional({ description: 'Display order' })
    @IsNumber()
    @IsOptional()
    displayOrder?: number;

    @ApiPropertyOptional({ description: 'Is active status' })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
