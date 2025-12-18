import { Inject, Injectable } from '@nestjs/common';
import type { UserRepository } from '../repository/user/user.repo';
import { USER_REPOSITORY } from '../tokens';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
  ) {}

  // 初回ログイン判定API
  async check(auth0Id: string): Promise<boolean> {
    const user = await this.userRepo.findByAuth0Id(auth0Id);
    return !!user;
  }

  async create(data: any) {
    return await this.userRepo.create(data);
  }

  async get(auth0Id: string) {
    return await this.userRepo.findByAuth0Id(auth0Id);
  }

  async update(auth0Id: string, data: any) {
    return await this.userRepo.update(auth0Id, data);
  }
}