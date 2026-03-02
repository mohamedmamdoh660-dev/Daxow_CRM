import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Prisma } from '@prisma/client';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('agents')
export class AgentsController {
    constructor(private readonly agentsService: AgentsService) { }

    @Post()
    @RequirePermissions({ module: 'Agents', action: 'add' })
    create(@Body() createAgentDto: Prisma.AgentCreateInput) {
        return this.agentsService.create(createAgentDto);
    }

    @Get()
    @RequirePermissions({ module: 'Agents', action: 'view' }, { module: 'Agents', action: 'view_all' })
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
    @RequirePermissions({ module: 'Agents', action: 'view' }, { module: 'Agents', action: 'view_all' })
    findOne(@Param('id') id: string) {
        return this.agentsService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions({ module: 'Agents', action: 'edit' })
    update(@Param('id') id: string, @Body() updateAgentDto: Prisma.AgentUpdateInput) {
        return this.agentsService.update(id, updateAgentDto);
    }

    @Delete(':id')
    @RequirePermissions({ module: 'Agents', action: 'delete' })
    remove(@Param('id') id: string) {
        return this.agentsService.remove(id);
    }
}
