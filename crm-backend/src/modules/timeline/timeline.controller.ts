import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TimelineService } from './timeline.service';
import { CreateTimelineEventDto } from './dto/create-timeline-event.dto';

@ApiTags('Timeline')
@Controller('timeline')
export class TimelineController {
    constructor(private readonly timelineService: TimelineService) { }

    @Post()
    @ApiOperation({ summary: 'Create timeline event' })
    @ApiResponse({ status: 201, description: 'Event created successfully' })
    create(@Body() createTimelineEventDto: CreateTimelineEventDto) {
        return this.timelineService.createEvent(createTimelineEventDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all timeline events' })
    @ApiResponse({ status: 200, description: 'List of events' })
    @ApiQuery({ name: 'entityType', required: false })
    @ApiQuery({ name: 'entityId', required: false })
    @ApiQuery({ name: 'eventType', required: false })
    @ApiQuery({ name: 'performedBy', required: false })
    findAll(
        @Query('entityType') entityType?: string,
        @Query('entityId') entityId?: string,
        @Query('eventType') eventType?: string,
        @Query('performedBy') performedBy?: string,
    ) {
        return this.timelineService.findAll({
            entityType,
            entityId,
            eventType,
            performedBy,
        });
    }

    @Get(':entityType/:entityId')
    @ApiOperation({ summary: 'Get timeline for specific entity' })
    @ApiResponse({ status: 200, description: 'Entity timeline' })
    getEntityTimeline(
        @Param('entityType') entityType: string,
        @Param('entityId') entityId: string,
    ) {
        return this.timelineService.getEntityTimeline(entityType, entityId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete timeline event' })
    @ApiResponse({ status: 200, description: 'Event deleted successfully' })
    remove(@Param('id') id: string) {
        return this.timelineService.remove(id);
    }
}
