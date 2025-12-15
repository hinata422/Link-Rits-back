import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseClient } from './main';

import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { UserRepositoryImpl } from './repository/user/psql/user.repo.impl';
import { UserRepository } from './repository/user/user.repo';
import { EventController } from './controller/event.controller';
import { EventService } from './service/event.service';
import { EventRepositoryImpl } from './repository/event/psql/event.repo.impl';
import { EventRepository } from './repository/event/event.repo';

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
      provide: EventRepository,
      useClass: EventRepositoryImpl,
    },
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
    UserService,
    EventService,
  ],
  exports: [EventRepository, UserRepository],
})
export class AppModule {}