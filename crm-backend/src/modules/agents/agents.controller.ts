import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Prisma } from '@prisma/client';

@Controller('agents')
@UseGuards(JwtAuthGuard)
export class AgentsController {
    constructor(private readonly agentsService: AgentsService) { }

    @Post()
    create(@Body() createAgentDto: Prisma.AgentCreateInput) {
        return this.agentsService.create(createAgentDto);
    }

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
        @Query('search') search?: string,
    ) {
        return this.agentsService.findAll(
            Number(page) || 1,
            Number(pageSize) || 10,
            search,
        );
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.agentsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateAgentDto: Prisma.AgentUpdateInput) {
        return this.agentsService.update(id, updateAgentDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.agentsService.remove(id);
    }
}
