import { PrismaClient } from '@prisma/client';
import { EventsService } from '../src/events/events.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { RitsumeikanStrategy } from '../src/scraping/strategies/ritsumeikan.strategy';

async function main() {
    console.log('--- Production DB Verification (Deep Check) Start ---');

    if (!process.env.DATABASE_URL) {
        console.error('❌ Error: DATABASE_URL is not set. Make sure to run with dotenv -e .env.production');
        process.exit(1);
    }

    // Initialize Services
    // Force use of DIRECT_URL if available to avoid PgBouncer "prepared statement" errors in transaction mode
    const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
    console.log(`🔌 Connecting to DB... (Using ${process.env.DIRECT_URL ? 'DIRECT_URL' : 'DATABASE_URL'})`);

    const prisma = new PrismaService({
        datasources: {
            db: {
                url: connectionUrl,
            },
        },
    });
    await prisma.onModuleInit(); // Connect to DB

    const eventsService = new EventsService(prisma);
    const strategy = new RitsumeikanStrategy();

    try {
        // 0. RESET DB (Clear data to test from scratch)
        console.log('🧹 Clearing DB tables (EventMbti / EventPost -> Event) ...');
        // Delete in order to avoid foreign key constraints
        // await prisma.categoryOfRoom.deleteMany({}); // Schemaから削除されたため
        await prisma.eventMbti.deleteMany({});
        await prisma.eventPost.deleteMany({});
        await prisma.event.deleteMany({});
        console.log('✨ DB Cleared.');

        // 1. Initial Check (Should be 0)
        const initialCount = await prisma.event.count();
        console.log(`📊 Initial Event Count in DB: ${initialCount} (Expected 0)`);

        // 2. Scrape & Save (Run 1)
        console.log('🕷️  [Run 1] Starting scraping...');
        const url = 'https://www.ritsumei.ac.jp/events/';
        const eventsRun1 = await strategy.scrape(url);

        if (eventsRun1.length === 0) {
            console.warn('⚠️  No events found to save. Verification stops here.');
            return;
        }

        console.log(`💾 [Run 1] Saving ${eventsRun1.length} events to DB...`);
        await eventsService.saveEvents(eventsRun1);

        // 3. Verify Run 1 & Check Dates
        const countAfterRun1 = await prisma.event.count();
        console.log(`📊 Event Count after Run 1: ${countAfterRun1}`);

        // STRICT SUCCESS CHECK
        if (countAfterRun1 === 0) {
            console.error('❌ FAILURE: Run 1 completed but NO events were saved to DB.');
            console.error('   Possible causes: Transaction failure, Unique constraint violations, or Silent errors in saveEvents.');
            // Check if User exists
            const systemUser = await prisma.user.findUnique({ where: { id: '00000000-0000-0000-0000-000000000000' } });
            console.log(`   System User Exists? ${!!systemUser}`);
            return;
        }

        if (countAfterRun1 > 0) {
            console.log('\n🔍 Verifying Date Fields for the first saved event:');
            const firstEvent = await prisma.event.findFirst();
            if (firstEvent) {
                console.log(`   ID: ${firstEvent.id}`);
                console.log(`   Title: ${firstEvent.title}`);
                console.log(`   Date Text: ${firstEvent.dateText}`);
                console.log(`   Start At: ${firstEvent.startAt.toISOString()} (Local: ${firstEvent.startAt.toLocaleString()})`);
                console.log(`   End At:   ${firstEvent.endAt.toISOString()}   (Local: ${firstEvent.endAt.toLocaleString()})`);
                console.log(`   Scraped At: ${firstEvent.scrapedAt.toISOString()}`);
                // console.log(`   Created At: ${firstEvent.createdAt.toISOString()}`);
                // console.log(`   Updated At: ${firstEvent.updatedAt.toISOString()}`);
            }
        }

        // 4. Scrape & Save (Run 2: Test Deduplication)
        console.log('\n🕷️  [Run 2] Re-running scraping to test deduplication...');
        // Scrape again to simulate periodic execution
        const eventsRun2 = await strategy.scrape(url);
        console.log(`💾 [Run 2] Attempting to save ${eventsRun2.length} events again...`);
        await eventsService.saveEvents(eventsRun2);

        // 5. Verify Run 2 (Count should NOT increase significantly)
        const countAfterRun2 = await prisma.event.count();
        console.log(`📊 Event Count after Run 2: ${countAfterRun2}`);

        if (countAfterRun2 === countAfterRun1) {
            console.log('✅ Success! No duplicate events were created.');
        } else {
            console.warn(`⚠️  Warning: Event count increased by ${countAfterRun2 - countAfterRun1}. Duplicates might have been created.`);
            console.log('   Note: If the scraping result changed between runs (e.g. new event added), this might be valid.');
        }

    } catch (error) {
        console.error('❌ Error during verification:', error);
    } finally {
        await prisma.onModuleDestroy(); // Disconnect
    }
}

main();
