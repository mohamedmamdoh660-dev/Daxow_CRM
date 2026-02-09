import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { StudentsModule } from './modules/students/students.module';
import { LeadsModule } from './modules/leads/leads.module';
import { CountriesModule } from './modules/countries/countries.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { AcademicYearsModule } from './modules/academic-years/academic-years.module';
import { SemestersModule } from './modules/semesters/semesters.module';
import { CitiesModule } from './modules/cities/cities.module';
import { FacultiesModule } from './modules/faculties/faculties.module';
import { LanguagesModule } from './modules/languages/languages.module';
import { SpecialtiesModule } from './modules/specialties/specialties.module';
import { TitlesModule } from './modules/titles/titles.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { DegreesModule } from './modules/degrees/degrees.module';
import { AgentsModule } from './modules/agents/agents.module';

import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    StudentsModule,
    LeadsModule,
    CountriesModule,
    ApplicationsModule,
    TasksModule,
    TimelineModule,
    AcademicYearsModule,
    SemestersModule,
    CitiesModule,
    FacultiesModule,
    LanguagesModule,
    SpecialtiesModule,
    TitlesModule,
    ProgramsModule,
    DegreesModule,
    AgentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
