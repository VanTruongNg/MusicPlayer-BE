import { DeleteObjectCommand, PutObjectAclCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
    private readonly s3Client: S3Client
    private readonly s3Bucket: string
    private readonly s3Region: string

    constructor(
        private readonly configService: ConfigService
    ) {
        this.s3Region = this.configService.get<string>('AWS_S3_REGION')

        this.s3Client = new S3Client({
            region: this.s3Region,
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY'),
                secretAccessKey: this.configService.get<string>('AWS_S3_SECRET_ACCESS_KEY')
            },
            forcePathStyle: true
        })
        this.s3Bucket = this.configService.get<string>('AWS_S3_PUBLIC_BUCKET')
    }

    async uploadFile (file: Express.Multer.File, fileName: string): Promise<string> {
        const uploadParam = {
            Body: file.buffer,
            Bucket: this.s3Bucket,
            Key: fileName,
            ContentType: file.mimetype
        }

        try {
            await this.s3Client.send(new PutObjectCommand(uploadParam))
            return `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com/${fileName}`
        } catch (error) {
            throw new HttpException ('Upload file thất bại!', HttpStatus.BAD_REQUEST)
        }
    }

    async deleteFile(fileName: string): Promise<void> {
        const deleteParam = {
            Bucket: this.s3Bucket,
            Key: fileName
        }

        try {
            await this.s3Client.send(new DeleteObjectCommand(deleteParam))
        } catch (error) {
            throw new HttpException('Xóa file thất bại!', HttpStatus.BAD_REQUEST)
        }
    }
}
