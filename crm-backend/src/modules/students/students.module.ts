import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { TimelineModule } from '../timeline/timeline.module';
import { PrismaService } from '../../database/prisma.service';

@Module({
    imports: [TimelineModule],
    controllers: [StudentsController],
    providers: [StudentsService, PrismaService],
    exports: [StudentsService],
})
export class StudentsModule { }
