import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateGenreDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}