import { Module } from '@nestjs/common';
import { GenreService } from './genre.service';
import { GenreController } from './genre.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Genre ]),
    AuthModule
  ],
  controllers: [GenreController],
  providers: [GenreService],
  exports: [ TypeOrmModule ]
})
export class GenreModule {}
