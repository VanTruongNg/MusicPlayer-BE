import { Body, ClassSerializerInterceptor, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ArtistService } from './artist.service';
import { Artist } from './entities/artist.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/auth/RoleGuard/role.guard';
import { Roles } from 'src/auth/RoleGuard/role.decorator';
import { Role } from 'src/auth/entities/role.enum';

@Controller('artist')
@UseInterceptors(ClassSerializerInterceptor)
export class ArtistController {
  constructor(
    private readonly artistService: ArtistService
  ) {}

  @Get()
  async getAll(): Promise<Artist[]> {
    return this.artistService.findAll()
  }

  @Get('random-artist')
  async getRandomArtist(): Promise<Artist[]> {
    return this.artistService.findRandomArtist()
  }

  @Get('search')
  async searchArtists(@Query('q') query: string): Promise<Artist[]> {
    try {
      return await this.artistService.searchArtists(query);
    } catch (error) {
      throw error instanceof HttpException ? error : new HttpException('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('top') 
  async getTopArtists(@Query('limit') limit: number): Promise<Artist[]> {
    try {
      return await this.artistService.getTopArtists(limit);
    } catch (error) {
      throw error instanceof HttpException ? error : new HttpException('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getArtistById(@Param('id') id: string): Promise<Artist> {
    try {
      return this.artistService.findById(id)
    } catch (error) {
      throw error instanceof HttpException ? error : new HttpException('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get(':id/songs')
  async getArtistSongs(@Param('id') id: string): Promise<Artist> {
    try {
      return await this.artistService.getArtistSongs(id);
    } catch (error) {
      throw error instanceof HttpException ? error : new HttpException('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('avatar'))
  async addArtist(
    @Body() body: { name: string }, 
    @UploadedFile() file: Express.Multer.File
  ): Promise<Artist> {
    try {
      return await this.artistService.createArtist(body.name, file);
    } catch (error) {
      throw error instanceof HttpException ? error : new HttpException('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateArtist(
    @Param('id') id: string,
    @Body('name') name: string,
    @UploadedFile() avatar?: Express.Multer.File
  ): Promise<Artist> {
    try {
      return await this.artistService.updateArtist(id, name, avatar);
    } catch (error) {
      throw error instanceof HttpException ? error : new HttpException('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('update-artist-profile/:id')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateArtistAvatar (@Param('id') id: string, @UploadedFile() file: Express.Multer.File): Promise<Artist> {
    try {
      return this.artistService.updateArtistProfile(id, file)
    } catch (error) {
      throw error instanceof HttpException ? error : new HttpException('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  async deleteArtist(@Param('id') id: string): Promise<void> {
    try {
      return await this.artistService.deleteArtist(id);
    } catch (error) {
      throw error instanceof HttpException ? error : new HttpException('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
