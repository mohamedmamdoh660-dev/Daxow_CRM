import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('programs')
export class ProgramsController {
    constructor(private readonly programsService: ProgramsService) { }

    @Post()
    @RequirePermissions({ module: 'Programs', action: 'add' })
    create(@Body() createProgramDto: CreateProgramDto) {
        return this.programsService.create(createProgramDto);
    }

    @Get()
    @RequirePermissions({ module: 'Programs', action: 'view' }, { module: 'Programs', action: 'view_all' })
    findAll(
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
        @Query('search') search?: string,
        @Query('facultyId') facultyId?: string,
        @Query('specialtyId') specialtyId?: string,
        @Query('degreeId') degreeId?: string,
        @Query('countryId') countryId?: string,
        @Query('cityId') cityId?: string,
        @Query('languageId') languageId?: string,
        @Query('isActive') isActive?: string,
    ) {
        return this.programsService.findAll(page, pageSize, search, {
            facultyId,
            specialtyId,
            degreeId,
            countryId,
            cityId,
            languageId,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        });
    }

    @Get(':id')
    @RequirePermissions({ module: 'Programs', action: 'view' }, { module: 'Programs', action: 'view_all' })
    findOne(@Param('id') id: string) {
        return this.programsService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions({ module: 'Programs', action: 'edit' })
    update(@Param('id') id: string, @Body() updateProgramDto: UpdateProgramDto) {
        return this.programsService.update(id, updateProgramDto);
    }

    @Delete(':id')
    @RequirePermissions({ module: 'Programs', action: 'delete' })
    remove(@Param('id') id: string) {
        return this.programsService.remove(id);
    }
}
