import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';

async function main() {
    console.log('--- DB Schema Diagnosis ---');

    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL missing.');
        process.exit(1);
    }

    const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
    const prisma = new PrismaService({
        datasources: { db: { url: connectionUrl } },
    });
    await prisma.onModuleInit();

    try {
        console.log('1. Testing User table access (ID only)...');
        try {
            const userIds = await prisma.user.findFirst({ select: { id: true } });
            console.log(`✅ Success. Found user ID: ${userIds?.id || 'None'}`);
        } catch (e) {
            console.log('❌ Failed to select ID.');
        }

        console.log('2. Testing User table access (Email only)...');
        try {
            const userEmails = await prisma.user.findFirst({ select: { email: true } });
            console.log(`✅ Success. Found user Email: ${userEmails?.email || 'None'}`);
        } catch (e) {
            console.log('❌ Failed to select email column (Expected if missing).');
        }

        // Check raw columns
        console.log('3. Querying information_schema...');
        const columns: any[] = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `;
        console.log('📊 Columns in users table:');
        columns.forEach(c => console.log(`   - ${c.column_name} (${c.data_type})`));

    } catch (error) {
        console.error('❌ Detailed Error:', error);
    } finally {
        await prisma.onModuleDestroy();
    }
}

main();
