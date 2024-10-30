import { IsString, IsNotEmpty } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  @IsNotEmpty()
  keyword: string;
}