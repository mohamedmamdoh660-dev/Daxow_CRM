import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCityDto {
    @ApiProperty({ example: 'Istanbul', description: 'City name' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'clxxx...', description: 'Country ID' })
    @IsString()
    countryId: string;

    @ApiProperty({ example: true, description: 'Is this city active?', required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
