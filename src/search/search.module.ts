import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SongModule } from 'src/song/song.module';
import { ArtistModule } from 'src/artist/artist.module';
import { AlbumModule } from 'src/album/album.module';

@Module({
  imports: [SongModule, ArtistModule, AlbumModule],
  controllers: [SearchController],
  providers: [SearchService]
})
export class SearchModule {}
