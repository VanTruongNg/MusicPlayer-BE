import { HttpException, HttpStatus, Injectable, NotFoundException, Response } from '@nestjs/common';
import { SignInDTO } from './dto/signin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs'
import * as nodemailer from 'nodemailer'
import { Token } from './entities/token.entity';
import { SignUpDTO } from './dto/signup.dto';
import { ResetPassword } from './entities/password-reset.entity';
import { PaswordResetResponseDTO } from './dto/password-reset.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Token) private readonly tokenRepository: Repository<Token>,
    @InjectRepository(ResetPassword) private readonly resetPasswordRepository: Repository<ResetPassword>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async signup (signup: SignUpDTO): Promise<boolean> {
    const { username, email, password, confirmPassword } = signup

    const user = await this.userRepository.findOneBy({ email: email })
    if (user) {
      throw new HttpException({
        error: 'User đã tồn tại!',
        code: 'SIGNUP.USER_EXISTED'
      }, HttpStatus.CONFLICT)
    }

    if (password !== confirmPassword) {
      throw new HttpException('SIGNUP.Mật khẩu và mật khẩu xác nhận phải trùng khớp!', HttpStatus.BAD_REQUEST)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const savedUser = this.userRepository.create({
      username: username,
      email: email,
      password: hashedPassword,
      isActive: true,
    })

    await this.userRepository.save(savedUser)

    if (!savedUser) {
      throw new HttpException('SIGNUP.Tạo tài khoản không thành công!', HttpStatus.BAD_REQUEST)
    }

    return true
  }

  async signin (signin: SignInDTO, @Response() res): Promise<void> {
    const { email, password } = signin

    const user = await this.userRepository.findOne({
      where: {email: email}
    })
    if (!user) {
      throw new HttpException("SIGNIN.User không tồn tại!", HttpStatus.NOT_FOUND)
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password)
    if (!isPasswordMatched) {
      throw new HttpException("SIGNIN.Mật khẩu không chính xác!", HttpStatus.UNAUTHORIZED)
    }

    const refreshToken = await this.jwtService.sign({ id: user.id, type: 'refresh_token'}, {
      secret: process.env.REFRESH_SECRET,
      expiresIn: process.env.REFRESH_EXPIRES
    })
    const token = this.tokenRepository.create({
      user: user,
      token: refreshToken,
      createdAt: new Date(),
      expriredAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    })
    await this.tokenRepository.save(token)

    const accessToken = await this.jwtService.sign({ id: user.id, email: user.email }) 
    
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 15 * 60 * 1000,
      sameSite: 'Lax',
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'Lax',
    })

    res.status(HttpStatus.OK).send({ message: "Đăng nhập thành công!" });
  }

  async logout (refreshToken: string, @Response() res): Promise<void> {
    const token = await this.tokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user']
    })

    if (!token) {
      throw new HttpException('TOKEN.Không thể tìm thấy refresh token!', HttpStatus.NOT_FOUND);
    }

    token.isRevoked = true;
    await this.tokenRepository.save(token);

    res.clearCookie('accessToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    res.send({ message: 'Đăng xuất thành công.' });
  }

  async refreshToken (refreshToken: string, @Response() res): Promise<void> {
    const token = await this.tokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user']
    })

    if (!token) {
      throw new HttpException('TOKEN.Không thể tìm thấy refresh token!', HttpStatus.NOT_FOUND)
    }

    if (token.isRevoked) {
      throw new HttpException('TOKEN.Token đã bị thu hồi!', HttpStatus.FORBIDDEN)
    }

    if (new Date() > new Date(token.expriredAt)) {
      throw new HttpException('TOKEN.Token đã hết hạn!', HttpStatus.FORBIDDEN)
    }

    const user = await this.userRepository.findOne({
      where: { id: token.user.id }
    })

    if (!user) {
      throw new HttpException('TOKEN.KHông tìm thấy người dùng!', HttpStatus.NOT_FOUND)
    }

    const accessToken = await this.jwtService.sign({ id: user.id, email: user.email })

    const newRefreshToken = await this.jwtService.sign({ id: user.id, type: 'refresh_token' }, {
      secret: process.env.REFRESH_SECRET,
      expiresIn: process.env.REFRESH_EXPIRES
    });

    token.token = newRefreshToken
    token.expriredAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await this.tokenRepository.save(token)

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        maxAge: 15 * 60 * 1000,
        sameSite: 'Lax',
    });

    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'Lax',
    });

    res.send({ message: 'Tokens đã được làm mới thành công.' });
  }

  async createPasswordResetToken (email: string): Promise<PaswordResetResponseDTO> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['resetPassword']
    })
    if (!user) {
      throw new HttpException({
        error: 'Không tìm thấy người dùng',
        code: 'TOKEN.USER_NOT_FOUND'
      }, HttpStatus.NOT_FOUND)
    }

    const passwordReset = user.resetPassword.find(ev => (new Date().getTime() - ev.createdAt.getTime()) / 60000 < 2);

    if (passwordReset && (new Date().getTime() - passwordReset.createdAt.getTime()) / 60000 < 2) {
      throw new HttpException ({
        error: 'Email đã được gửi! Thử lại sau 2 phút!',
        code: 'EMAILVERIFICATION.EMAIL_SENT'
      }, HttpStatus.CONFLICT)   
    }

    const resetToken = this.resetPasswordRepository.create({
      resetToken: (Math.floor(Math.random() * 900000) + 100000).toString(),
      createdAt: new Date(),
      expriredAt: new Date(new Date().getTime() + 15 * 60000),
      user: user
    })

    await this.resetPasswordRepository.save(resetToken)

    const dto: PaswordResetResponseDTO = {
      resetToken: resetToken.resetToken,
      email: user.email,
      createdAt: resetToken.createdAt,
      expiredAt: resetToken.expriredAt
    }

    return dto
  }

  async sendResetPassword(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { email }
    })
    if (!user) {
      throw new HttpException('RESETPASSWORD.Người dùng không tồn tại', HttpStatus.INTERNAL_SERVER_ERROR)
    }

    const resetToken = await this.createPasswordResetToken(email)

    if (resetToken && resetToken.resetToken) {
      const transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST'),
        port: this.configService.get<string>('SMTP_PORT'),
        secure: this.configService.get<boolean>('SMTP_SECURE'),
        auth: {
          user: this.configService.get<string>('GMAIL_USER'),
          pass: this.configService.get<string>('GMAIL_PASSWORD')
        }
      })

      const mailOptions = {
        from: `"MangaHybrid Authentication System" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Reset Password',
        text: 'Reset Password',
        html: `Xin chào! <br><br> Bạn đã yêu cầu để reset password <3<br><br> ${resetToken.resetToken}`
      }

      const sent = await new Promise<boolean>((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            reject(false);
          }
          resolve(true);
        })
      })

      return sent
    }

    return false
  }
  
  async resetPassword (token: string, password: string, confirmPassword: string): Promise<void> {
    const passwordReset = await this.resetPasswordRepository.findOne({
      where: { resetToken: token },
      relations: ['user']
    })

    if (!passwordReset) {
      throw new HttpException('TOKEN.Không tìm thấy token!', HttpStatus.NOT_FOUND)
    }

    if (new Date() > new Date(passwordReset.expriredAt)) {
      throw new HttpException('TOKEN.Token đã hết hạn!', HttpStatus.FORBIDDEN)
    }

    if (password !== confirmPassword) {
      throw new HttpException('PASSWORD.Mật khẩu và mật khẩu xác nhận không khớp!', HttpStatus.BAD_REQUEST)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    passwordReset.user.password = hashedPassword
    await this.userRepository.save(passwordReset.user)

    await this.resetPasswordRepository.remove(passwordReset)
  }
}
