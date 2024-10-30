import { Module } from '@nestjs/common';
import { ArtistService } from './artist.service';
import { ArtistController } from './artist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from './entities/artist.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Artist ]),
    AuthModule,
    AwsModule
  ],
  controllers: [ArtistController],
  providers: [ArtistService],
  exports: [TypeOrmModule]
})
export class ArtistModule {}
