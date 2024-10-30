import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { UserReponseDTO } from './dto/user-response.dto';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly awsService: AwsService
  ) {}

  async getAllUser (): Promise<UserReponseDTO[]> {
    try {
      return await this.userRepository.find({
        select: ['id', 'email', 'avatarUrl', 'role', 'isActive']
      });
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new HttpException('Lỗi khi lấy danh sách người dùng.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserById (id: string): Promise<UserReponseDTO> {
    const user = await this.userRepository.findOne ({
      where: { id },
      select: ['id', 'username', 'email', 'avatarUrl', 'role', 'isActive' ]
    })

    if (!user) {
      throw new HttpException('USER.User không tồn tại', HttpStatus.NOT_FOUND)
    }

    return user
  }

  async updateAvatarUrl (id: string, file: Express.Multer.File): Promise<UserReponseDTO> {
    const user = await this.userRepository.findOne ({
      where: { id },
      select: ['id', 'email', 'avatarUrl', 'role', 'isActive']
    })

    if (!user) {
      throw new HttpException('USER.User không tồn tại', HttpStatus.NOT_FOUND)
    }

    const fileName = user.id
    const avatarUrl = await this.awsService.uploadFile(file, fileName)

    user.avatarUrl = avatarUrl
    await this.userRepository.save(user)

    return user
  }
}
