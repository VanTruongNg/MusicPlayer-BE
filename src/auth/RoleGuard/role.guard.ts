import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor (
        private reflector: Reflector
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<string[]>('roles', context.getHandler())
        if (!roles) {
            return true
        }
        const req = context.switchToHttp().getRequest()
        const user = req.user

        if (!user) {
            throw new HttpException('Không tìm thấy thông tin user trong request', HttpStatus.UNAUTHORIZED)
        }
        return roles.includes(user.role)
    }
}