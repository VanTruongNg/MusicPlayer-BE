import { Module } from '@nestjs/common';
import { AlbumService } from './album.service';
import { AlbumController } from './album.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Album } from './entities/album.entity';
import { ArtistModule } from 'src/artist/artist.module';
import { AwsModule } from 'src/aws/aws.module';
import { SongModule } from 'src/song/song.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Album ]),
    ArtistModule,
    SongModule,
    AwsModule,
    AuthModule
  ],
  controllers: [AlbumController],
  providers: [AlbumService],
  exports: [TypeOrmModule]
})
export class AlbumModule {}
