import { Title } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class TitleEntity implements Title {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
