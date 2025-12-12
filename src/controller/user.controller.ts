import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { UserService } from '../service/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 初回ログイン判定API
  @Get('check/:auth0Id')
  async check(@Param('auth0Id') auth0Id: string) {
    // Auth: そのまま auth0Id を使用
    return await this.userService.checkUser(auth0Id);
  }

  @Post()
  async create(@Body() body: any) {
    // Auth: リクエストは auth0Id を前提に受け付ける
    return await this.userService.createUser(body);
  }

  @Get(':auth0Id')
  async getOne(@Param('auth0Id') auth0Id: string) {
    // Auth: auth0Id で検索
    return await this.userService.getUser(auth0Id);
  }

  @Put(':auth0Id')
  async update(@Param('auth0Id') auth0Id: string, @Body() body: any) {
    // Auth: auth0Id で更新。body は auth0Id 前提
    return await this.userService.updateUser(auth0Id, body);
  }
}