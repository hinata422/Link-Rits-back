import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';

async function main() {
    if (!process.env.DATABASE_URL) process.exit(1);

    const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
    const prisma = new PrismaService({
        datasources: { db: { url: connectionUrl } },
    });
    await prisma.onModuleInit();

    try {
        console.log('Checking specific columns in users table...');
        const result: any[] = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('email', 'auth0_sub', 'uid', 'name');
    `;
        console.log('Existing columns:', JSON.stringify(result, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.onModuleDestroy();
    }
}

main();
