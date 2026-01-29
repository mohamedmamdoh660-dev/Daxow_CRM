import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTitleDto {
    @ApiProperty({ example: 'Engineer', description: 'Title Name' })
    @IsString()
    name: string;

    @ApiProperty({ example: true, description: 'Is active?' })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
