import { IsDate, IsEmail, IsString } from "class-validator";

export class PaswordResetResponseDTO {
    @IsEmail()
    @IsString()
    email: string

    @IsString()
    resetToken: string

    @IsDate()
    createdAt: Date

    @IsDate()
    expiredAt: Date;
}