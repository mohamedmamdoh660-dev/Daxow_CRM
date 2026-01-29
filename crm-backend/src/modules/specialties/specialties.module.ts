import { Module } from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { SpecialtiesController } from './specialties.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [SpecialtiesController],
    providers: [SpecialtiesService],
    exports: [SpecialtiesService],
})
export class SpecialtiesModule { }
