import { Controller, Get, HttpException, HttpStatus, Patch, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/auth/RoleGuard/role.guard';
import { Roles } from 'src/auth/RoleGuard/role.decorator';
import { Role } from 'src/auth/entities/role.enum';
import { User } from 'src/auth/entities/user.entity';
import { UserReponseDTO } from './dto/user-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('all')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  async getAllUser(): Promise<UserReponseDTO[]> {
    const users = await this.userService.getAllUser();
    return users;
  }

  @Get('me')
  @UseGuards(AuthGuard())
  async getUserById(@Req() req: any): Promise<UserReponseDTO> {
    try {
      return this.userService.getUserById(req.user.id)
    } catch (error) {
      throw error instanceof HttpException ? error : new HttpException('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Patch('/update-avatar')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar (@Req() req: any, @UploadedFile() file: Express.Multer.File): Promise<UserReponseDTO> {
    try {
      return this.userService.updateAvatarUrl(req.user.id, file)
    } catch (error) {
      throw error instanceof HttpException ? error : new HttpException('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
