import { Module } from '@nestjs/common';
import { AcademicYearsService } from './academic-years.service';
import { AcademicYearsController } from './academic-years.controller';
import { DatabaseModule } from '../../database/database.module';
import { TimelineModule } from '../timeline/timeline.module';

@Module({
    imports: [DatabaseModule, TimelineModule],
    controllers: [AcademicYearsController],
    providers: [AcademicYearsService],
    exports: [AcademicYearsService],
})
export class AcademicYearsModule { }
