import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Album } from 'src/album/entities/album.entity';
import { Artist } from 'src/artist/entities/artist.entity';
import { Song } from 'src/song/entities/song.entity';
import { Like, Repository } from 'typeorm';
import { SearchResponse } from './interface/search.interface';
import { SearchQueryDto } from './dto/search.dto';

@Injectable()
export class SearchService {
    constructor(
        @InjectRepository(Song)
        private readonly songRepository: Repository<Song>,
        @InjectRepository(Artist)
        private readonly artistRepository: Repository<Artist>,
        @InjectRepository(Album)
        private readonly albumRepository: Repository<Album>,
      ) {}

        async search(query: SearchQueryDto): Promise<SearchResponse> {
            const { keyword } = query;
            const searchPattern = `%${keyword}%`;
        
            const [songs, artists, albums] = await Promise.all([
            // Tìm bài hát
            this.songRepository.find({
                where: [
                { title: Like(searchPattern) },
                ],
                relations: ['artists', 'album'],
            }),
        
            // Tìm nghệ sĩ
            this.artistRepository.find({
                where: [
                { name: Like(searchPattern) },
                ],
            }),
        
            // Tìm album
            this.albumRepository.find({
                where: [
                { title: Like(searchPattern) },
                ],
                relations: ['artist'],
            }),
            ]);
        
            return {
            songs,
            artists,
            albums,
            };
        }
}
