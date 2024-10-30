import { CreateSongDto } from './dto/create-song.dto';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Put, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { SongService } from './song.service';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Song } from './entities/song.entity';
import { UpdateArtistsDto } from './dto/update-artists.dto';
import { UpdateGenresDto } from './dto/update-genres.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/auth/RoleGuard/role.guard';
import { Roles } from 'src/auth/RoleGuard/role.decorator';
import { Role } from 'src/auth/entities/role.enum';

@Controller('song')
export class SongController {
  constructor(private readonly songService: SongService) {}

  @Get()
  async findAll(): Promise<Song[]> {
    return this.songService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Song> {
    return await this.songService.findSongById(id);
}

  @Post('create-song')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'coverImg', maxCount: 1 },
    { name: 'mp3File', maxCount: 1 },
  ]))
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  async createSong (@Body() createSongDto: CreateSongDto, @UploadedFiles() files: { coverImg?: Express.Multer.File, mp3File?: Express.Multer.File}): Promise<Song> {
    try {
      const coverImg = files.coverImg[0];
      const mp3File = files.mp3File[0];
      return await this.songService.createSong(createSongDto, coverImg, mp3File)
    } catch (error) {
      throw error instanceof HttpException ? error : new HttpException ('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR)
    }  
  }

  @Put(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<Song>,
    @UploadedFile() coverImg?: Express.Multer.File
  ): Promise<Song> {
      return await this.songService.updateSong(id, updateData, coverImg);
  }

  @Put(':id/file')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('mp3File'))
  async updateFile(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() mp3File: Express.Multer.File
  ): Promise<Song> {
      return await this.songService.updateSongFile(id, mp3File);
  }

  @Patch(':id/update-artists')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  async updateArtist (@Param('id') songId: string, @Body() updateArtistsDto: UpdateArtistsDto): Promise<Song> {
    try {
      return await this.songService.updateArtistForSong(songId, updateArtistsDto)
    } catch (error) {
      throw error instanceof HttpException ? error : new HttpException ('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Patch(':id/update-genres')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  async updateGenre (@Param('id') id: string, @Body() updateGenreDto: UpdateGenresDto): Promise<Song> {
    try {
      return await this.songService.updateGenresForSong(id, updateGenreDto)
    } catch (error) {
      throw error instanceof HttpException ? error : new HttpException ('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Delete(':id/artists/:artistId')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  async removeArtist(
    @Param('id', ParseUUIDPipe) songId: string,
    @Param('artistId', ParseUUIDPipe) artistId: string
  ): Promise<Song> {
    return await this.songService.removeArtistFromSong(songId, artistId);
  }

  @Delete(':id/genres/:genreId')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  async removeGenre(
    @Param('id', ParseUUIDPipe) songId: string,
    @Param('genreId', ParseUUIDPipe) genreId: string
  ): Promise<Song> {
    return await this.songService.removeGenreFromSong(songId, genreId);
  }

  @Get('genre/:genreId')
  async findByGenre(@Param('genreId', ParseUUIDPipe) genreId: string): Promise<Song[]> {
    return await this.songService.findSongsByGenre(genreId);
  }

  @Get('artist/:artistId')
  async findByArtist(@Param('artistId', ParseUUIDPipe) artistId: string): Promise<Song[]> {
    return await this.songService.findSongsByArtist(artistId);
  }

  @Get('album/:albumId')
  async findByAlbum(@Param('albumId', ParseUUIDPipe) albumId: string): Promise<Song[]> {
    return await this.songService.findSongsByAlbum(albumId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.songService.deleteSongAndResources(id);
  }

  @Get('search')
  async search(@Query('q') query: string): Promise<Song[]> {
    return await this.songService.searchSongs(query);
  }
}
