import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { Token } from "./entities/token.entity";
import { Strategy, ExtractJwt} from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Token) private readonly tokenRepository: Repository<Token>
    ) {
        super ({
            jwtFromRequest: ExtractJwt.fromExtractors([(req) => {
                return req?.cookies?.accessToken || null
            }]),
            secretOrKey: process.env.JWT_SECRET
        })
    }

    async validate (payload) {
        const { id } = payload

        if (payload.type) {
            throw new HttpException('AUTH.JWT không hợp lệ', HttpStatus.FORBIDDEN)
        }

        const user = await this.userRepository.findOne ({
            where: { id: id }
        })

        if (!user) {
            throw new HttpException("AUTH.Người dùng không tồn tại", HttpStatus.UNAUTHORIZED)
        }

        const token = await this.tokenRepository.findOne ({
            where: {user: user},
            order: {
                createdAt: 'DESC'
            }
        })

        if (token.isRevoked) {
            throw new HttpException('AUTH.Token đã bị vô hiệu hoá. Hãy đăng nhập lại!', HttpStatus.FORBIDDEN)
        }

        return user
    }
}