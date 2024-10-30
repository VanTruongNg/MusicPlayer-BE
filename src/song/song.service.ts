import { UpdateArtistsDto } from './dto/update-artists.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Song } from './entities/song.entity';
import { In, Repository } from 'typeorm';
import { CreateSongDto } from './dto/create-song.dto';
import { Artist } from 'src/artist/entities/artist.entity';
import { normalizeString } from 'src/utils/string.util';
import { AwsService } from 'src/aws/aws.service';
import { UpdateGenresDto } from './dto/update-genres.dto';
import { Genre } from 'src/genre/entities/genre.entity';

@Injectable()
export class SongService {
    constructor(
        @InjectRepository(Song) private readonly songRepository: Repository<Song>,
        @InjectRepository(Artist) private readonly artistRepository: Repository<Artist>,
        @InjectRepository(Genre) private readonly genreRepository: Repository<Genre>,
        private readonly awsService: AwsService
    ){}

    async findAll(): Promise<Song[]> {
        return await this.songRepository.find({
            relations: ['artists', 'album', 'genres']
        });
    }  

    async findSongById(id: string): Promise<Song> {
        const song = await this.songRepository.findOne({
            where: { id },
            relations: ['artists', 'album', 'genres']
        });

        if (!song) {
            throw new HttpException('SONG.Bài hát không tồn tại!', HttpStatus.NOT_FOUND);
        }

        return song;
    }

    async createSong (createSongDTO: CreateSongDto, coverImg: Express.Multer.File, mp3File: Express.Multer.File): Promise<Song> {
        const { title, artistId } = createSongDTO

        const artist = await this.artistRepository.findOne({ where: { id: artistId }})

        if (!artist) {
            throw new HttpException('ARTIST.Nghệ sĩ không tồn tại!', HttpStatus.NOT_FOUND);
        }

        const existedSong = await this.songRepository.findOne({
            where: { title: title, artists: { id: artistId } },
            relations: ['artists']
        })

        if (existedSong) {
            throw new HttpException('SONG.Bài hát đã tồn tại ở nghệ sĩ trên', HttpStatus.CONFLICT)
        }
        
        const newSong = this.songRepository.create({
            title: title,
            artists: [artist],
        })

        await this.songRepository.save(newSong)

        const fileName = `${newSong.id}-${normalizeString(newSong.title)}-cover`
        const fileMp3 = `${newSong.id}-${normalizeString(newSong.title)}-mp3`
        const [coverImgUrl, fileUrl] = await Promise.all([
            this.awsService.uploadFile(coverImg, fileName),
            this.awsService.uploadFile(mp3File, fileMp3)
        ]);

        newSong.coverImgUrl = coverImgUrl
        newSong.fileUrl = fileUrl

        return await this.songRepository.save(newSong)
    }

    async updateArtistForSong(songId: string, updateArtistsDto: UpdateArtistsDto): Promise<Song>{
        const { artistIds } = updateArtistsDto
        const song = await this.songRepository.findOne({
            where: { id: songId },
            relations: ['artists']
        })

        if (!song) {
            throw new HttpException('SONG.Bài hát không tồn tại', HttpStatus.NOT_FOUND)
        }

        const artist = await this.artistRepository.findBy({
            id: In(artistIds)
        })

        if (artistIds.length !== artist.length) {
            throw new HttpException('ARTIST.Nghệ sĩ không tồn tại', HttpStatus.NOT_FOUND)
        }

        const existingArtist = song.artists.map(artist => artist.id)
        const newArtists = artist.filter(artist => !existingArtist.includes(artist.id))
        song.artists = [...song.artists, ...newArtists]

        return await this.songRepository.save(song)
    }

    async updateGenresForSong (songId: string, updateGenreDto: UpdateGenresDto): Promise<Song> {
        const { genreIds } = updateGenreDto

        const song = await this.songRepository.findOne({
            where: { id: songId },
            relations: ['genres']
        })

        if (!song) {
            throw new HttpException('SONG.Bài hát không tồn tại', HttpStatus.NOT_FOUND)
        }

        const genres = await this.genreRepository.findBy({
            id: In(genreIds)
        })

        if (genreIds.length !== genres.length) {
            throw new HttpException('GENRE.Thể loại không tồn tại', HttpStatus.NOT_FOUND)
        }

        const existingGenre = song.genres.map(genre => genre.id)
        const newGenre = genres.filter( genre => !existingGenre.includes(genre.id))

        song.genres = [...song.genres, ...newGenre]

        return await this.songRepository.save(song)
    }

    async deleteSong(id: string): Promise<void> {
        const song = await this.findSongById(id);
        await this.songRepository.remove(song);
    }

    async updateSong(
        id: string, 
        updateData: Partial<Song>,
        coverImg?: Express.Multer.File
    ): Promise<Song> {
        const song = await this.findSongById(id);

        // Nếu có upload ảnh mới
        if (coverImg) {
            const fileName = `${song.id}-${normalizeString(updateData.title || song.title)}-cover`;
            const coverImgUrl = await this.awsService.uploadFile(coverImg, fileName);
            updateData.coverImgUrl = coverImgUrl;

            // Xóa ảnh cũ nếu có
            if (song.coverImgUrl) {
                await this.awsService.deleteFile(song.coverImgUrl);
            }
        }

        // Cập nhật thông tin
        Object.assign(song, updateData);
        return await this.songRepository.save(song);
    }

    async updateSongFile(
        id: string,
        mp3File: Express.Multer.File
    ): Promise<Song> {
        const song = await this.findSongById(id);

        const fileName = `${song.id}-${normalizeString(song.title)}-mp3`;
        const fileUrl = await this.awsService.uploadFile(mp3File, fileName);

        // Xóa file cũ nếu có
        if (song.fileUrl) {
            await this.awsService.deleteFile(song.fileUrl);
        }

        song.fileUrl = fileUrl;
        return await this.songRepository.save(song);
    }

    async removeArtistFromSong(songId: string, artistId: string): Promise<Song> {
        const song = await this.findSongById(songId);
        
        song.artists = song.artists.filter(artist => artist.id !== artistId);
        
        if (song.artists.length === 0) {
            throw new HttpException(
                'SONG.Không thể xóa nghệ sĩ cuối cùng của bài hát',
                HttpStatus.BAD_REQUEST
            );
        }

        return await this.songRepository.save(song);
    }

    async removeGenreFromSong(songId: string, genreId: string): Promise<Song> {
        const song = await this.findSongById(songId);
        
        song.genres = song.genres.filter(genre => genre.id !== genreId);
        return await this.songRepository.save(song);
    }

    async findSongsByGenre(genreId: string): Promise<Song[]> {
        return await this.songRepository.find({
            where: {
                genres: {
                    id: genreId
                }
            },
            relations: ['artists', 'album', 'genres']
        });
    }

    async findSongsByArtist(artistId: string): Promise<Song[]> {
        return await this.songRepository.find({
            where: {
                artists: {
                    id: artistId
                }
            },
            relations: ['artists', 'album', 'genres']
        });
    }

    async findSongsByAlbum(albumId: string): Promise<Song[]> {
        return await this.songRepository.find({
            where: {
                album: {
                    id: albumId
                }
            },
            relations: ['artists', 'album', 'genres']
        });
    }

    async deleteSongAndResources(id: string): Promise<void> {
        const song = await this.findSongById(id);

        // Xóa file từ S3
        if (song.fileUrl) {
            await this.awsService.deleteFile(song.fileUrl);
        }
        if (song.coverImgUrl) {
            await this.awsService.deleteFile(song.coverImgUrl);
        }

        await this.songRepository.remove(song);
    }

    async searchSongs(query: string): Promise<Song[]> {
        return await this.songRepository
            .createQueryBuilder('song')
            .leftJoinAndSelect('song.artists', 'artist')
            .leftJoinAndSelect('song.genres', 'genre')
            .where('LOWER(song.title) LIKE LOWER(:query)', { query: `%${query}%` })
            .orWhere('LOWER(artist.name) LIKE LOWER(:query)', { query: `%${query}%` })
            .getMany();
    }
}
