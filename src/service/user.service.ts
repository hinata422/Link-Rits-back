import { Injectable } from '@nestjs/common';
import { UserRepositoryImpl } from '../repository/user/psql/user.repo.impl';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepositoryImpl) {}

  // 初回ログイン判定API
  async checkUser(auth0Id: string) {
    const user = await this.userRepo.findBySub(auth0Id);
    return { exists: !!user };
  }

  async createUser(data: any) {
    return await this.userRepo.create(data);
  }

  async getUser(auth0Id: string) {
    return await this.userRepo.findBySub(auth0Id);
  }

  async updateUser(auth0Id: string, data: any) {
    return await this.userRepo.update(auth0Id, data);
  }
}