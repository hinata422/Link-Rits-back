import { PrismaClient } from '@prisma/client';
import { EventsService } from '../src/events/events.service';
import { PrismaService } from '../src/prisma/prisma.service';

async function main() {
    console.log('--- Minimal Verification ---');
    if (!process.env.DATABASE_URL) process.exit(1);
    const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
    const prisma = new PrismaService({ datasources: { db: { url: connectionUrl } } });
    await prisma.onModuleInit();

    const eventsService = new EventsService(prisma);

    try {
        const dummyEvent = {
            title: "Test Event Minimal " + Date.now(),
            postTime: new Date(),
            postLimit: new Date(Date.now() + 86400000),
            detail: "Minimal Detail",
            place: "Minimal Place",
            url: "http://example.com"
        };

        console.log("Saving 1 event...");
        await eventsService.saveEvents([dummyEvent]);
        console.log("✅ Save called. Checking DB...");

        const count = await prisma.event.count({
            where: { title: dummyEvent.title }
        });
        console.log(`Events found: ${count}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.onModuleDestroy();
    }
}

main();
