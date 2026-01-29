import { Module } from '@nestjs/common';
import { DegreesService } from './degrees.service';
import { DegreesController } from './degrees.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DegreesController],
  providers: [DegreesService],
  exports: [DegreesService],
})
export class DegreesModule { }
