import { Module } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { TimelineController } from './timeline.controller';

@Module({
    controllers: [TimelineController],
    providers: [TimelineService],
    exports: [TimelineService], // Export so other modules can use it
})
export class TimelineModule { }
