import { IsNotEmpty, IsString } from "class-validator";

export class CreateSongDto {
    @IsString()
    @IsNotEmpty()
    title: string

    @IsString()
    @IsNotEmpty()
    artistId: string
}
