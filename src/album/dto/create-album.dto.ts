import { IsDateString, IsNotEmpty,  IsString, IsUUID } from "class-validator";

export class CreateAlbumDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsDateString()
    releaseDate: string;

    @IsNotEmpty({ message: 'artistId không được để trống' })
    @IsUUID('4', { message: 'artistId phải là UUID hợp lệ' })
    artistId: string;
}
