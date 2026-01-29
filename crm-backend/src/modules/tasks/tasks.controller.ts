import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new task' })
    @ApiResponse({ status: 201, description: 'Task created successfully' })
    create(@Body() createTaskDto: CreateTaskDto) {
        return this.tasksService.create(createTaskDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all tasks with optional filters' })
    @ApiResponse({ status: 200, description: 'List of tasks' })
    @ApiQuery({ name: 'entityType', required: false, enum: ['Lead', 'Student', 'Application'] })
    @ApiQuery({ name: 'entityId', required: false, description: 'Filter by entity ID' })
    @ApiQuery({ name: 'status', required: false, enum: ['Open', 'In Progress', 'Completed', 'Cancelled'] })
    @ApiQuery({ name: 'assignedTo', required: false, description: 'Filter by assigned user' })
    findAll(
        @Query('entityType') entityType?: string,
        @Query('entityId') entityId?: string,
        @Query('status') status?: string,
        @Query('assignedTo') assignedTo?: string,
    ) {
        return this.tasksService.findAll({
            entityType,
            entityId,
            status,
            assignedTo,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a task by ID' })
    @ApiResponse({ status: 200, description: 'Task found' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    findOne(@Param('id') id: string) {
        return this.tasksService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a task' })
    @ApiResponse({ status: 200, description: 'Task updated successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.tasksService.update(id, updateTaskDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a task' })
    @ApiResponse({ status: 200, description: 'Task deleted successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    remove(@Param('id') id: string) {
        return this.tasksService.remove(id);
    }
}
