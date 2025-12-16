import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';

import { UserRepositoryImpl } from './repository/user/psql/user.repo.impl';
import { UserRepository } from './repository/user/user.repo';
import { EventController } from './controller/event.controller';
import { EventService } from './service/event.service';
import { EventRepositoryImpl } from './repository/event/psql/event.repo.impl';
import { supabaseClient } from './main';
import { SupabaseClient } from '@supabase/supabase-js';
export const EVENT_REPOSITORY = Symbol('EventRepository');
export const USER_REPOSITORY = Symbol('UserRepository');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ← これで全ファイルから.env が使える
    }),
  ],
  controllers: [UserController, EventController],
  providers: [
    {
      provide: SupabaseClient,
      useValue: supabaseClient,
    },
    {
      provide: EVENT_REPOSITORY,
      useClass: EventRepositoryImpl,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
    UserService,
    EventService,
  ],
  exports: [EVENT_REPOSITORY, USER_REPOSITORY],
})
export class AppModule {}