import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Controller('programs')
export class ProgramsController {
    constructor(private readonly programsService: ProgramsService) { }

    @Post()
    create(@Body() createProgramDto: CreateProgramDto) {
        return this.programsService.create(createProgramDto);
    }

    @Get()
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
    findOne(@Param('id') id: string) {
        return this.programsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProgramDto: UpdateProgramDto) {
        return this.programsService.update(id, updateProgramDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.programsService.remove(id);
    }
}
