import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // モジュール初期化時にDBへ接続
  async onModuleInit() {
    await this.$connect();
  }

  // モジュール破棄時にDB切断（クリーンアップ）
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
