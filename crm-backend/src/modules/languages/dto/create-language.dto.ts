import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLanguageDto {
    @ApiProperty({ example: 'English', description: 'Language name' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'en', description: 'Language code', required: false })
    @IsString()
    @IsOptional()
    code?: string;

    @ApiProperty({ example: true, description: 'Is this language active?', required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
