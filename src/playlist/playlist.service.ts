import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from './entities/playlist.entity';
import { User } from '../auth/entities/user.entity';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { AwsService } from 'src/aws/aws.service';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    private readonly awsService: AwsService
  ) {}

  async findAll(user: User): Promise<Playlist[]> {
    return await this.playlistRepository.find({
      where: { user: { id: user.id } },
      relations: ['songs', 'user'],
    });
  }

  async findOne(id: string, user: User): Promise<Playlist> {
    const playlist = await this.playlistRepository.findOne({
      where: { id },
      relations: ['songs', 'user'],
    });

    if (!playlist) {
      throw new HttpException('PLAYLIST.Không tìm thấy playlist', HttpStatus.NOT_FOUND);
    }

    if (playlist.user.id !== user.id) {
      throw new HttpException('PLAYLIST.Bạn không có quyền truy cập playlist này', HttpStatus.FORBIDDEN);
    }

    return playlist;
  }

  async createPlaylist(
    user: User, 
    createPlaylistDto: CreatePlaylistDto,
    coverImage?: Express.Multer.File
): Promise<Playlist> {
    const playlist = this.playlistRepository.create({
      ...createPlaylistDto,
      user: user,
      songs: [],
    });
    
    const savedPlaylist = await this.playlistRepository.save(playlist);
    
    if (coverImage) {
      const fileName = `playlists/covers/${savedPlaylist.id}`;
      const coverImgUrl = await this.awsService.uploadFile(coverImage, fileName);
      savedPlaylist.coverImgUrl = coverImgUrl;
      return await this.playlistRepository.save(savedPlaylist);
    }

    return savedPlaylist;
}

async update(
    id: string,
    user: User,
    updatePlaylistDto: UpdatePlaylistDto,
    coverImage?: Express.Multer.File,
): Promise<Playlist> {
    const playlist = await this.findOne(id, user);
  
    if (coverImage) {
      const fileName = `playlists/covers/${playlist.id}`;
      const coverImgUrl = await this.awsService.uploadFile(coverImage, fileName);
      playlist.coverImgUrl = coverImgUrl;
    }
  
    Object.assign(playlist, updatePlaylistDto);
    return await this.playlistRepository.save(playlist);
}

  async remove(id: string, user: User): Promise<void> {
    const playlist = await this.findOne(id, user);
    await this.playlistRepository.remove(playlist);
  }

  async addSong(playlistId: string, songId: string, user: User): Promise<Playlist> {
    const playlist = await this.findOne(playlistId, user);
    
    const songExists = playlist.songs.some(song => song.id === songId);
    if (songExists) {
      throw new HttpException('PLAYLIST.Bài hát đã tồn tại trong playlist', HttpStatus.BAD_REQUEST);
    }

    playlist.songs.push({ id: songId } as any);
    return await this.playlistRepository.save(playlist);
  }

  async removeSong(playlistId: string, songId: string, user: User): Promise<Playlist> {
    const playlist = await this.findOne(playlistId, user);
    playlist.songs = playlist.songs.filter(song => song.id !== songId);
    return await this.playlistRepository.save(playlist);
  }
}