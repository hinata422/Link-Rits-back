import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from '../service/user.service';

@Controller('api/auth')
export class AuthController {
    constructor(private readonly userService: UserService) { }

    /**
     * GET /api/auth/[auth0]
     * ログイン/ログアウト/コールバック処理
     * ユーザー認証 - Auth0で認証されたユーザーが新規登録済みかどうかを判定
     */
    @Get(':auth0')
    async check(@Param('auth0') linkUserCode: string) {
        const user = await this.userService.get(linkUserCode);

        if (!user) {
            // 新規ユーザー - 登録が必要
            return {
                isRegistered: false,
                requiresRegistration: true,
                message: 'ユーザーが見つかりません。登録を完了してください。',
            };
        }

        // 登録済みユーザー
        return {
            isRegistered: true,
            requiresRegistration: false,
            user,
        };
    }
}
