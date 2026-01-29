import { Module } from '@nestjs/common';
import { SemestersService } from './semesters.service';
import { SemestersController } from './semesters.controller';
import { DatabaseModule } from '../../database/database.module';
import { TimelineModule } from '../timeline/timeline.module';

@Module({
    imports: [DatabaseModule, TimelineModule],
    controllers: [SemestersController],
    providers: [SemestersService],
    exports: [SemestersService],
})
export class SemestersModule { }
