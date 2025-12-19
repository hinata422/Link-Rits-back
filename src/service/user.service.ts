import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user/user.repo';
import { TYPES } from '../../common/Types';

@Injectable()
export class UserService {
  constructor(
    @Inject(TYPES.UserRepository)
    private readonly userRepo: UserRepository,
  ) {}

  // ユーザー新規登録
  async create(data: any) {
    return await this.userRepo.create(data);
  }

  // ユーザー情報取得
  async get(auth0Id: string) {
    return await this.userRepo.findByAuth0Id(auth0Id);
  }

  // ユーザー情報更新
  async update(auth0Id: string, data: any) {
    return await this.userRepo.update(auth0Id, data);
  }
}