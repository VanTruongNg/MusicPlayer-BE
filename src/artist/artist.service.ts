import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Artist } from './entities/artist.entity';
import { Repository } from 'typeorm';
import { AwsService } from 'src/aws/aws.service';
import { normalizeString } from 'src/utils/string.util';

@Injectable()
export class ArtistService {
  constructor(
    @InjectRepository(Artist) private readonly artistRepository: Repository<Artist>,
    private readonly awsService: AwsService
  ) {}

  async findAll(): Promise<Artist[]> {
    return await this.artistRepository.find()
  }

  async findRandomArtist(): Promise<Artist[]> {
    return await this.artistRepository.createQueryBuilder('artist').orderBy('RANDOM()').limit(6).getMany()
  }

  async findById(artistId: string): Promise<Artist> {
    const artist = await this.artistRepository.findOne({
      where: { id: artistId }
    })

    if (!artist) {
      throw new HttpException('ARTIST.Nghệ sĩ không tồn tại!', HttpStatus.NOT_FOUND)
    }

    return artist
  }

  async createArtist (name: string, avatar: Express.Multer.File): Promise<Artist> {

    const artist = await this.artistRepository.findOne({
      where: { name: name }
    })

    if (artist) {
      throw new HttpException('ARTIST.Nghệ sĩ đã tồn tại', HttpStatus.CONFLICT)
    }

    const newArtist = this.artistRepository.create({
      name: name,
    })
    await this.artistRepository.save(newArtist);


    if (avatar) {
      const fileName = `${newArtist.id}-${normalizeString(name)}`
      newArtist.avatarUrl = await this.awsService.uploadFile(avatar, fileName)
    }

    return await this.artistRepository.save(newArtist)
  }

  async updateArtistProfile (id: string, file: Express.Multer.File): Promise<Artist> {
    const artist = await this.artistRepository.findOne({
      where: { id: id }
    })

    if (!artist) {
      throw new HttpException('ARTIST.Nghệ sĩ không tồn tại!', HttpStatus.NOT_FOUND)
    }

    const fileName = `${artist.id}-${normalizeString(artist.name)}`
    artist.avatarUrl = await this.awsService.uploadFile(file, fileName)

    return await this.artistRepository.save(artist)
  }

  async searchArtists(query: string): Promise<Artist[]> {
    return await this.artistRepository
      .createQueryBuilder('artist')
      .where('LOWER(artist.name) LIKE LOWER(:query)', { query: `%${query}%` })
      .getMany();
  }

  async deleteArtist(id: string): Promise<void> {
    const artist = await this.findById(id);
    
    if (artist.avatarUrl) {
      await this.awsService.deleteFile(`${artist.id}-${normalizeString(artist.name)}`);
    }
    
    await this.artistRepository.remove(artist);
  }

  async updateArtist(
    id: string, 
    name: string,
    avatar?: Express.Multer.File
  ): Promise<Artist> {
    const artist = await this.findById(id);
    
    if (name !== artist.name) {
      const existingArtist = await this.artistRepository.findOne({
        where: { name }
      });

      if (existingArtist) {
        throw new HttpException('ARTIST.Nghệ sĩ đã tồn tại', HttpStatus.CONFLICT);
      }
    }

    artist.name = name;

    if (avatar) {
      const fileName = `${artist.id}-${normalizeString(name)}`;
      artist.avatarUrl = await this.awsService.uploadFile(avatar, fileName);
    }

    return await this.artistRepository.save(artist);
  }

  async getArtistSongs(id: string): Promise<Artist> {
    const artist = await this.artistRepository.findOne({
      where: { id },
      relations: ['songs'],
    });

    if (!artist) {
      throw new HttpException('ARTIST.Nghệ sĩ không tồn tại!', HttpStatus.NOT_FOUND);
    }

    return artist;
  }

  async getTopArtists(limit: number = 10): Promise<Artist[]> {
    return await this.artistRepository
      .createQueryBuilder('artist')
      .leftJoinAndSelect('artist.songs', 'song')
      .addSelect('COUNT(song.id)', 'songCount')
      .groupBy('artist.id')
      .orderBy('songCount', 'DESC')
      .limit(limit)
      .getMany();
  }
}
