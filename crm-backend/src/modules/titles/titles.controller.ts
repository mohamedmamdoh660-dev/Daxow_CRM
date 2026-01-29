import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    DefaultValuePipe,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TitlesService } from './titles.service';
import { CreateTitleDto } from './dto/create-title.dto';
import { UpdateTitleDto } from './dto/update-title.dto';

@ApiTags('Titles')
@Controller('titles')
export class TitlesController {
    constructor(private readonly titlesService: TitlesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new title' })
    @ApiResponse({ status: 201, description: 'Title created successfully' })
    create(@Body() createTitleDto: CreateTitleDto) {
        return this.titlesService.create(createTitleDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all titles' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'pageSize', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'List of titles' })
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
        @Query('search') search?: string,
        @Query('isActive') isActive?: string,
    ) {
        const skip = (page - 1) * pageSize;
        return this.titlesService.findAll({
            skip,
            take: pageSize,
            search,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get title by ID' })
    @ApiResponse({ status: 200, description: 'Title found' })
    @ApiResponse({ status: 404, description: 'Title not found' })
    findOne(@Param('id') id: string) {
        return this.titlesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update title' })
    @ApiResponse({ status: 200, description: 'Title updated successfully' })
    @ApiResponse({ status: 404, description: 'Title not found' })
    update(@Param('id') id: string, @Body() updateTitleDto: UpdateTitleDto) {
        return this.titlesService.update(id, updateTitleDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete title' })
    @ApiResponse({ status: 200, description: 'Title deleted successfully' })
    @ApiResponse({ status: 404, description: 'Title not found' })
    remove(@Param('id') id: string) {
        return this.titlesService.remove(id);
    }
}
