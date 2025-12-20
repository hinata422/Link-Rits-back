import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

async function main() {
    console.log('--- Simple Insert Test ---');
    if (!process.env.DATABASE_URL) process.exit(1);
    const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
    const prisma = new PrismaService({ datasources: { db: { url: connectionUrl } } });
    await prisma.onModuleInit();

    try {
        const uid = '00000000-0000-0000-0000-000000000001'; // New ID

        console.log('1. Creating/Finding User...');
        let user = await prisma.user.findUnique({ where: { id: uid } });
        if (!user) {
            try {
                user = await prisma.user.create({
                    data: {
                        id: uid,
                        displayName: 'Test User',
                        linkUserCode: 'test_code_' + Date.now(),
                    }
                });
                console.log('✅ User created.');
            } catch (e) {
                console.error('❌ User creation failed:', e);
                throw e;
            }
        } else {
            console.log('ℹ️ User exists.');
        }

        console.log('2. Creating Event...');
        const eventId = uuidv4();
        try {
            await prisma.event.create({
                data: {
                    id: eventId,
                    title: 'Test Event',
                    place: 'Test Place',
                    detail: 'Test Detail',
                    scrapedAt: new Date(),
                    startAt: new Date(),
                    endAt: new Date(),
                    dateText: '2025-12-31',
                }
            });
            console.log('✅ Event created.');
        } catch (e) {
            console.error('❌ Event creation failed:', e);
            throw e;
        }

        console.log('3. Creating EventPost...');
        try {
            await prisma.eventPost.create({
                data: {
                    id: uuidv4(),
                    userId: uid,
                    eventId: eventId,
                    postTime: new Date(),
                    postLimit: new Date(),
                }
            });
            console.log('✅ EventPost created.');
        } catch (e) {
            console.error('❌ EventPost creation failed:', e);
            throw e;
        }

    } catch (error) {
        console.error('💥 Fatal Error:', error);
    } finally {
        await prisma.onModuleDestroy();
    }
}

main();
