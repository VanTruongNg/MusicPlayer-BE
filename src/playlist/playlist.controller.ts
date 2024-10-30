import { Controller, Post, Body, UseGuards, Request, UseInterceptors, UploadedFile, HttpException, HttpStatus, ClassSerializerInterceptor, Delete, Param, Put, Get } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

@Controller('playlists')
@UseGuards(AuthGuard())
@UseInterceptors(ClassSerializerInterceptor)
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post()
  @UseInterceptors(FileInterceptor('coverImage'))
  async create(
    @Request() req,
    @Body() createPlaylistDto: CreatePlaylistDto,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    return await this.playlistService.createPlaylist(req.user, createPlaylistDto, coverImage);
  }

  @Get()
  async findAll(@Request() req) {
    return await this.playlistService.findAll(req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return await this.playlistService.findOne(id, req.user);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('coverImage'))
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    return await this.playlistService.update(id, req.user, updatePlaylistDto, coverImage);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return await this.playlistService.remove(id, req.user);
  }

  @Post(':id/songs/:songId')
  async addSong(
    @Param('id') playlistId: string,
    @Param('songId') songId: string,
    @Request() req,
  ) {
    return await this.playlistService.addSong(playlistId, songId, req.user);
  }

  @Delete(':id/songs/:songId')
  async removeSong(
    @Param('id') playlistId: string,
    @Param('songId') songId: string,
    @Request() req,
  ) {
    return await this.playlistService.removeSong(playlistId, songId, req.user);
  }
}