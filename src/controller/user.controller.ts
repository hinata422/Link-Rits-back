import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { UserService } from '../service/user.service';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  /**
   * POST /api/users/
   * ユーザーの新規登録
   * Auth0でsignupしたとき
   */
  @Post()
  async create(@Body() body: {
    link_user_code: string; // Auth0のsub (uniq)
    name: string;
    mbti_type?: string; // enum; MBTI; nullable
  }) {
    // link_user_code を auth0Id にマッピング
    const userData = {
      auth0Id: body.link_user_code,
      name: body.name,
      mbtiType: body.mbti_type,
    };
    return await this.userService.create(userData);
  }

  /**
   * GET /api/users/[link_user_code]
   * ユーザー情報を取得する
   * - ユーザーがログインしているか確認
   * - MBTI登録が完了しているか確認
   */
  @Get(':link_user_code')
  async get(@Param('link_user_code') linkUserCode: string) {
    const user = await this.userService.get(linkUserCode);
    if (!user) {
      return {
        exists: false,
        mbtiRegistered: false,
      };
    }
    return {
      exists: true,
      mbtiRegistered: !!user.mbtiType,
      user,
    };
  }

  /**
   * PUT /api/users/[link_user_code]
   * ユーザー情報を更新する
   * - MBTIの登録をする
   * - ユーザープロフィールを更新する
   */
  @Put(':link_user_code')
  async update(
    @Param('link_user_code') linkUserCode: string,
    @Body() body: {
      name?: string;
      mbti_type?: string; // enum; MBTI; nullable
    },
  ) {
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.mbti_type) updateData.mbtiType = body.mbti_type;

    return await this.userService.update(linkUserCode, updateData);
  }
}