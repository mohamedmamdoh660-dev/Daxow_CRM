import { Module } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [LanguagesController],
    providers: [LanguagesService],
    exports: [LanguagesService],
})
export class LanguagesModule { }
