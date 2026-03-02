import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { TimelineModule } from '../timeline/timeline.module';
import { PrismaService } from '../../database/prisma.service';

@Module({
    imports: [TimelineModule],
    controllers: [LeadsController],
    providers: [LeadsService, PrismaService],
    exports: [LeadsService],
})
export class LeadsModule { }
