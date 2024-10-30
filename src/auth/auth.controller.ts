import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDTO } from './dto/signup.dto';
import { SignInDTO } from './dto/signin.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signup (@Body() signup: SignUpDTO): Promise<{message: string}> {
    const result = await this.authService.signup(signup);
    if (result) {
      return { message: 'Đăng ký tài khoản thành công. Kiểm tra email để xác thực!' };
    } else {
      throw new HttpException('Đăng ký không thành công', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  async signin (@Body() signin: SignInDTO, @Res() res: Response): Promise<void> {
    console.log("Signin request:", signin);
    return await this.authService.signin(signin, res);
  } 

  @Post('/logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
        throw new HttpException('TOKEN.Không thể tìm thấy refresh token!', HttpStatus.UNAUTHORIZED);
    }

    try {
        await this.authService.logout(refreshToken, res);
    } catch (error) {
        throw error instanceof HttpException ? error : new HttpException('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/refresh-token') 
  async refreshToken (@Req() req: Request, @Res() res: Response): Promise<void> {
    const refreshToken  = req.cookies.refreshToken;
    try {
      await this.authService.refreshToken(refreshToken, res);
    } catch (error) {
      throw error instanceof HttpException ? error: new HttpException('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
