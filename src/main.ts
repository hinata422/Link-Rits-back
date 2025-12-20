import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createClient } from '@supabase/supabase-js';

export const supabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

console.log('Supabase Client initialized:', {
  hasClient: !!supabaseClient,
  hasUrl: !!process.env.SUPABASE_URL,
  hasKey: !!process.env.SUPABASE_SERVICE_KEY,
});
console.log('🔑 Key starts with:', process.env.SUPABASE_SERVICE_KEY?.substring(0, 30) + '...');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
  process.exit(1); // 異常終了させる
});
