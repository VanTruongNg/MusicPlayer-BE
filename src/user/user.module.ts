import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [
    AuthModule,
    AwsModule
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
