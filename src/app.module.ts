import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { UserRepositoryImpl } from './repository/user/psql/user.repo.impl';
import { EventController } from './controller/event.controller';
import { EventService } from './service/event.service';
import { EventRepositoryImpl } from './repository/event/psql/event.repo.impl';
import { EventEditedService } from './service/event-edited.service';
import { EventEditedRepositoryImpl } from './repository/event-edited/psql/event-edited.repo.impl';
import { supabaseClient } from './main';
import { SupabaseClient } from '@supabase/supabase-js';
import { TYPES } from '../common/Types';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [UserController, EventController],
  providers: [
    {
      provide: SupabaseClient,
      useValue: supabaseClient,
    },
    {
      provide: TYPES.EventRepository,
      useClass: EventRepositoryImpl,
    },
    {
      provide: TYPES.UserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: TYPES.EventEditedRepository,
      useClass: EventEditedRepositoryImpl,
    },
    UserService,
    EventService,
    EventEditedService,
  ],
  exports: [TYPES.EventRepository, TYPES.UserRepository, TYPES.EventEditedRepository],
})
export class AppModule {}