import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class SignInDTO {
    @IsNotEmpty()
    @IsEmail({}, { message: 'Nhập email chính xác' })
    readonly email: string

    @IsNotEmpty()
    @MinLength(6)
    @IsString()
    readonly password: string
}
