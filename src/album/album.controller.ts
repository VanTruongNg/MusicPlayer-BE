import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AlbumService } from './album.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Album } from './entities/album.entity';
import { CreateAlbumDto } from './dto/create-album.dto';
import { AddSongDto } from './dto/add-song.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/auth/RoleGuard/role.guard';
import { Roles } from 'src/auth/RoleGuard/role.decorator';
import { Role } from 'src/auth/entities/role.enum';
import { UpdateAlbumDto } from './dto/update-album.dto';

@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Get()
  async findAll(): Promise<Album[]> {
    return this.albumService.findAll();
  }

  @Get('search')
  async searchAlbums(@Query('q') query: string) {
    return await this.albumService.searchAlbums(query);
  }

  @Get('latest')
  async getLatestAlbums(@Query('limit') limit: number) {
    return await this.albumService.getLatestAlbums(limit);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.albumService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('coverImg'))
  async create(
    @Body() createAlbumDto: CreateAlbumDto,
    @UploadedFile() coverImg: Express.Multer.File
  ) {
    return await this.albumService.createAlbum(createAlbumDto, coverImg);
  }

  @Put(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('coverImg'))
  async update(
    @Param('id') id: string,
    @Body() updateAlbumDto: UpdateAlbumDto,
    @UploadedFile() coverImg?: Express.Multer.File
  ) {
    return await this.albumService.updateAlbum(id, updateAlbumDto, coverImg);
  }

  @Delete(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string) {
    return await this.albumService.deleteAlbum(id);
  }

  @Post('add-song')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  async addSongToAlbum (@Body() addSongDto: AddSongDto): Promise<Album> {
    try {
      return await this.albumService.addSongToAlbum(addSongDto)
    } catch (error) {
      throw error instanceof HttpException ? error : new HttpException('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Delete(':albumId/songs/:songId')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  async removeSong(
    @Param('albumId') albumId: string,
    @Param('songId') songId: string
  ) {
    return await this.albumService.removeSongFromAlbum(albumId, songId);
  }
}
