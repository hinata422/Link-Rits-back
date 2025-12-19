import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';

import { UserController } from './controller/user.controller';
import { EventController } from './controller/event.controller';
import { EventEditedController } from './controller/event-edited.controller';

import { UserService } from './service/user.service';
import { EventService } from './service/event.service';
import { EventEditedService } from './service/event-edited.service';
import { PlainTextToMbtiLikeConverter } from './service/plain-text-to-mbti-like-converter.service';

import { UserRepositoryImpl } from './repository/user/psql/user.repo.impl';
import { EventRepositoryImpl } from './repository/event/psql/event.repo.impl';
import { EventEditedRepositoryImpl } from './repository/event-edited/psql/event-edited.repo.impl';

import { supabaseClient } from './main';
import { TYPES } from '../common/Types';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // 必要なら envFilePath を後で追加してOK
      // envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
  ],
  controllers: [
    UserController,
    EventController,
    EventEditedController,
  ],
  providers: [
    {
      provide: SupabaseClient,
      useValue: supabaseClient,
    },
    {
      provide: TYPES.UserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: TYPES.EventRepository,
      useClass: EventRepositoryImpl,
    },
    {
      provide: TYPES.EventEditedRepository,
      useClass: EventEditedRepositoryImpl,
    },
    UserService,
    EventService,
    EventEditedService,
    PlainTextToMbtiLikeConverter,
  ],
  exports: [
    TYPES.UserRepository,
    TYPES.EventRepository,
    TYPES.EventEditedRepository,
  ],
})
export class AppModule {}