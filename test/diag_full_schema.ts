import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';

async function main() {
    if (!process.env.DATABASE_URL) process.exit(1);
    const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
    const prisma = new PrismaService({ datasources: { db: { url: connectionUrl } } });
    await prisma.onModuleInit();

    try {
        const tables = ['users', 'events', 'event_posts', 'events_mbti'];
        for (const table of tables) {
            console.log(`\n📊 Schema for table: ${table}`);
            const columns: any[] = await prisma.$queryRaw`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = ${table};
        `;
            columns.forEach(c => console.log(`   - ${c.column_name} (${c.data_type}, ${c.is_nullable})`));
        }
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.onModuleDestroy();
    }
}

main();
