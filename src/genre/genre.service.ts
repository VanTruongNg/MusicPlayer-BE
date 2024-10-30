import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { Repository } from 'typeorm';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre) private readonly genreRepository: Repository<Genre>
  ) {}

  async getAllGenre(): Promise<Genre[]> {
    return await this.genreRepository.find({
      relations: ['songs']
    });
  }

  async getGenreById(id: string): Promise<Genre> {
    const genre = await this.genreRepository.findOne({
      where: { id },
      relations: ['songs']
    });

    if (!genre) {
      throw new HttpException('GENRE.Thể loại không tồn tại!', HttpStatus.NOT_FOUND);
    }

    return genre;
  }

  async createGenre(name: string): Promise<Genre> {
    const normalizedInputName = String(name).toLowerCase().trim();

    const existedGenre = await this.genreRepository.findOne({
      where: { name: normalizedInputName }
    });

    if (existedGenre) {
      throw new HttpException('GENRE.Thể loại đã tồn tại!', HttpStatus.CONFLICT);
    }

    const genre = this.genreRepository.create({ name: normalizedInputName });
    return await this.genreRepository.save(genre);
  }

  async updateGenre(id: string, updateGenreDto: UpdateGenreDto): Promise<Genre> {
    const genre = await this.getGenreById(id);
    
    if (updateGenreDto.name) {
      const normalizedName = updateGenreDto.name.toLowerCase().trim();
      
      const existedGenre = await this.genreRepository.findOne({
        where: { name: normalizedName }
      });

      if (existedGenre && existedGenre.id !== id) {
        throw new HttpException('GENRE.Thể loại đã tồn tại!', HttpStatus.CONFLICT);
      }

      genre.name = normalizedName;
    }

    return await this.genreRepository.save(genre);
  }

  async deleteGenre(id: string): Promise<void> {
    const genre = await this.getGenreById(id);
    await this.genreRepository.remove(genre);
  }
}
