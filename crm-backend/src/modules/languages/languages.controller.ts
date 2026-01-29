import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LanguagesService } from './languages.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';

@ApiTags('Languages')
@Controller('languages')
export class LanguagesController {
    constructor(private readonly languagesService: LanguagesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new language' })
    @ApiResponse({ status: 201, description: 'Language created successfully' })
    create(@Body() createLanguageDto: CreateLanguageDto) {
        return this.languagesService.create(createLanguageDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all languages' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'pageSize', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'List of languages' })
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
        @Query('search') search?: string,
        @Query('isActive') isActive?: string,
    ) {
        const skip = (page - 1) * pageSize;
        return this.languagesService.findAll({
            skip,
            take: pageSize,
            search,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get language by ID' })
    @ApiResponse({ status: 200, description: 'Language found' })
    @ApiResponse({ status: 404, description: 'Language not found' })
    findOne(@Param('id') id: string) {
        return this.languagesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update language' })
    @ApiResponse({ status: 200, description: 'Language updated successfully' })
    @ApiResponse({ status: 404, description: 'Language not found' })
    update(@Param('id') id: string, @Body() updateLanguageDto: UpdateLanguageDto) {
        return this.languagesService.update(id, updateLanguageDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete language' })
    @ApiResponse({ status: 200, description: 'Language deleted successfully' })
    @ApiResponse({ status: 404, description: 'Language not found' })
    remove(@Param('id') id: string) {
        return this.languagesService.remove(id);
    }
}
