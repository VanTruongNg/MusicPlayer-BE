import { Controller, Get, HttpException, HttpStatus, Param, Body, Post, UseGuards, Delete, Put } from '@nestjs/common';
import { GenreService } from './genre.service';
import { Genre } from './entities/genre.entity';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/auth/RoleGuard/role.guard';
import { Roles } from 'src/auth/RoleGuard/role.decorator';
import { Role } from 'src/auth/entities/role.enum';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Controller('genre')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Get()
  async getAllGenres() {
    return await this.genreService.getAllGenre();
  }

  @Get(':id')
  async getGenreById(@Param('id') id: string) {
    return await this.genreService.getGenreById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  async createGenre(@Body('name') name: string) {
    return await this.genreService.createGenre(name);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  async updateGenre(
    @Param('id') id: string,
    @Body() updateGenreDto: UpdateGenreDto
  ) {
    return await this.genreService.updateGenre(id, updateGenreDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async deleteGenre(@Param('id') id: string) {
    return await this.genreService.deleteGenre(id);
  }
}
