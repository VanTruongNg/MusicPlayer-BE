import { IsEmail, IsString } from "class-validator";

export class UserReponseDTO {
    @IsString()
    id: string

    @IsString()
    username: string

    @IsEmail()
    email: string

    @IsString()
    avatarUrl?: string
}