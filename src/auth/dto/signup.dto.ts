import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";


export class SignUpDTO {
    @IsString()
    @IsNotEmpty({ message: 'Vui lòng nhập Username' })
    readonly username: string

    @IsEmail({}, { message: 'Nhập email chính xác!' })
    @IsString()
    @IsNotEmpty()
    email: string

    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" })
    readonly password: string;

    @IsNotEmpty()
    @IsString()
    readonly confirmPassword: string;
}
