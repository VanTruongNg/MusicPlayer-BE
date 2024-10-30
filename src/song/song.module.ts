import { Module } from '@nestjs/common';
import { SongService } from './song.service';
import { SongController } from './song.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Song } from './entities/song.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AwsModule } from 'src/aws/aws.module';
import { ArtistModule } from 'src/artist/artist.module';
import { GenreModule } from 'src/genre/genre.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Song ]),
    AuthModule,
    AwsModule,
    ArtistModule,
    GenreModule
  ],
  controllers: [SongController],
  providers: [SongService],
  exports: [TypeOrmModule]
})
export class SongModule {}
