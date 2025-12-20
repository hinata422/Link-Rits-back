import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { UserController } from './controller/user.controller';
import { EventController } from './controller/event.controller';
import { EventEditedController } from './controller/event-edited.controller';
import { TestMbtiController } from './controller/test-mbti.controller';

import { UserService } from './service/user.service';
import { EventService } from './service/event.service';
import { EventEditedService } from './service/event-edited.service';
import { PlainTextToMbtiLikeConverter } from './service/plain-text-to-mbti-like-converter.service';

import { UserRepositoryImpl } from './repository/user/psql/user.repo.impl';
import { EventRepositoryImpl } from './repository/event/psql/event.repo.impl';
import { EventEditedRepositoryImpl } from './repository/event-edited/psql/event-edited.repo.impl';

import { TYPES } from '../common/Types';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
  ],
  controllers: [
    UserController,
    EventController,
    EventEditedController,
    TestMbtiController,
  ],
  providers: [
    {
      provide: SupabaseClient,
      useFactory: () => {
        const client = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_KEY!,
        );
        console.log('🔍 SupabaseClient created in app.module:', {
          hasClient: !!client,
          hasUrl: !!process.env.SUPABASE_URL,
          hasKey: !!process.env.SUPABASE_SERVICE_KEY,
        });
        return client;
      },
    },
    {
      provide: TYPES.UserRepository,
      useFactory: (client: SupabaseClient) => {
        console.log('🔍 UserRepository factory, client:', !!client);
        return new UserRepositoryImpl(client);
      },
      inject: [SupabaseClient],
    },
    {
      provide: TYPES.EventRepository,
      useFactory: (client: SupabaseClient) => {
        console.log('🔍 EventRepository factory, client:', !!client);
        return new EventRepositoryImpl(client);
      },
      inject: [SupabaseClient],
    },
    {
      provide: TYPES.EventEditedRepository,
      useFactory: (client: SupabaseClient) => {
        console.log('🔍 EventEditedRepository factory, client:', !!client);
        return new EventEditedRepositoryImpl(client);
      },
      inject: [SupabaseClient],
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
export class AppModule { }