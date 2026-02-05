const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDuplicateTrips() {
    try {
        console.log("Fixing duplicate active trips...");

        // Find duplicate active trips
        const trips = await prisma.driverTrip.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' }
        });

        if (trips.length <= 1) {
            console.log("No duplicates found to fix.");
            return;
        }

        console.log(`Found ${trips.length} active trips. Keeping the latest one (ID: ${trips[0].id}).`);

        // Close others
        const tripsToClose = trips.slice(1);
        for (const trip of tripsToClose) {
            await prisma.driverTrip.update({
                where: { id: trip.id },
                data: { status: 'COMPLETED', endTime: new Date() }
            });
            console.log(`Closed old trip: ${trip.id}`);
        }

        console.log("Cleanup complete.");

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

fixDuplicateTrips();
