import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Album } from './entities/album.entity';
import { Artist } from 'src/artist/entities/artist.entity';
import { normalizeString } from 'src/utils/string.util';
import { AwsService } from 'src/aws/aws.service';
import { AddSongDto } from './dto/add-song.dto';
import { Song } from 'src/song/entities/song.entity';
import { UpdateAlbumDto } from './dto/update-album.dto';

@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(Album) private readonly albumRepository: Repository<Album>,
    @InjectRepository(Artist) private readonly artistRepository: Repository<Artist>,
    @InjectRepository(Song) private readonly songRepository: Repository<Song>,
    private readonly awsService: AwsService
  ) {}

  async findAll(): Promise<Album[]> {
    return await this.albumRepository.find({
      relations: ['artist', 'songs']
    })
  }

  async findById(id: string): Promise<Album> {
    const album = await this.albumRepository.findOne({
      where: { id },
      relations: ['artist', 'songs']
    });

    if (!album) {
      throw new HttpException('ALBUM.Album không tồn tại', HttpStatus.NOT_FOUND);
    }

    return album;
  }

  async searchAlbums(query: string): Promise<Album[]> {
    return await this.albumRepository
      .createQueryBuilder('album')
      .leftJoinAndSelect('album.artist', 'artist')
      .where('LOWER(album.title) LIKE LOWER(:query)', { query: `%${query}%` })
      .orWhere('LOWER(artist.name) LIKE LOWER(:query)', { query: `%${query}%` })
      .getMany();
  }

  async createAlbum(createAlbumDto: CreateAlbumDto, coverImg: Express.Multer.File): Promise<Album> {
    const { title, releaseDate, artistId} = createAlbumDto

    const artist = await this.artistRepository.findOne({
      where: { id: artistId }
    })
    if (!artist){
      throw new HttpException('ARTIST.Nghệ sĩ trên không tồn tại', HttpStatus.NOT_FOUND)
    }

    const album = await this.albumRepository.findOne({
      where: { title: title, artist: { id: artistId }},
      relations: ['artist']
    })
    if (album) {
      throw new HttpException ('ALBUM.Nghệ sĩ trên đã có album cùng tên', HttpStatus.CONFLICT)
    }

    const newAlbum = this.albumRepository.create({
      title: title,
      releaseDate: releaseDate,
      artist: artist
    })

    await this.albumRepository.save(newAlbum)

    const fileName = `${newAlbum.id}-${normalizeString(newAlbum.title)}-cover`
    const coverImgUrl = await this.awsService.uploadFile(coverImg, fileName)

    newAlbum.coverImgUrl = coverImgUrl
    
    return await this.albumRepository.save(newAlbum)
  }

  async updateAlbum(
    id: string,
    updateAlbumDto: UpdateAlbumDto,
    coverImg?: Express.Multer.File
  ): Promise<Album> {
    const album = await this.findById(id);
    const { title, releaseDate, artistId } = updateAlbumDto;

    if (artistId && artistId !== album.artist.id) {
      const artist = await this.artistRepository.findOne({
        where: { id: artistId }
      });
      if (!artist) {
        throw new HttpException('ARTIST.Nghệ sĩ không tồn tại', HttpStatus.NOT_FOUND);
      }
      album.artist = artist;
    }

    if (title && title !== album.title) {
      const existingAlbum = await this.albumRepository.findOne({
        where: { title, artist: { id: album.artist.id } },
        relations: ['artist']
      });
      if (existingAlbum) {
        throw new HttpException('ALBUM.Nghệ sĩ đã có album cùng tên', HttpStatus.CONFLICT);
      }
      album.title = title;
    }

    if (releaseDate) {
      album.releaseDate = releaseDate;
    }

    if (coverImg) {
      const fileName = `${album.id}-${normalizeString(album.title)}-cover`;
      album.coverImgUrl = await this.awsService.uploadFile(coverImg, fileName);
    }

    return await this.albumRepository.save(album);
  }

  async addSongToAlbum (addSongDto: AddSongDto): Promise<Album> {
    const { songId, albumId } = addSongDto

    const [album, song] = await Promise.all([
      this.albumRepository.findOne({
        where: { id: albumId },
        relations: ['artist', 'songs']
      }),
      this.songRepository.findOne({
        where: { id: songId },
        relations: ['artists']
      })
    ])

    if (!album) {
      throw new HttpException('ALBUM.Album không tồn tại', HttpStatus.NOT_FOUND)
    }

    
    if (!song || song.artists.length === 0) {
      throw new HttpException('SONG.Bài hát không tồn tại', HttpStatus.NOT_FOUND)
    }

    if (album.artist.id !== song.artists[0].id) {
      throw new HttpException('ALBUM.Không thể thêm bài hát của nghệ sĩ khác vào album', HttpStatus.FORBIDDEN)
    }

    if ( album.songs.some(existedSong => existedSong.id === song.id)) {
      throw new HttpException('ALBUM.Bài hát đã tồn tại trong album', HttpStatus.CONFLICT)
    }

    album.songs.push(song)
    return await this.albumRepository.save(album)
  }

  async removeSongFromAlbum(albumId: string, songId: string): Promise<Album> {
    const album = await this.findById(albumId);
    
    album.songs = album.songs.filter(song => song.id !== songId);
    return await this.albumRepository.save(album);
  }

  async getLatestAlbums(limit: number = 10): Promise<Album[]> {
    return await this.albumRepository.find({
      relations: ['artist'],
      order: { releaseDate: 'DESC' },
      take: limit
    });
  }

  async deleteAlbum(id: string): Promise<void> {
    const album = await this.findById(id);
    
    if (album.coverImgUrl) {
      const fileName = `${album.id}-${normalizeString(album.title)}-cover`;
      await this.awsService.deleteFile(fileName);
    }

    await this.albumRepository.remove(album);
  }

  async getAlbumsByArtist(artistId: string): Promise<Album[]> {
    return await this.albumRepository.find({
      where: { artist: { id: artistId } },
      relations: ['artist', 'songs']
    });
  }
}
