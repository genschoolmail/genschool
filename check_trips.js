const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDriverTrips() {
    try {
        console.log("Checking trips...");
        // Assuming we can find the driver. Let's list all active trips.
        const activeTrips = await prisma.driverTrip.findMany({
            where: {
                status: 'ACTIVE'
            },
            include: {
                driver: {
                    include: { user: true }
                }
            }
        });

        console.log(`Found ${activeTrips.length} active trips.`);
        activeTrips.forEach(trip => {
            console.log(`Trip ID: ${trip.id}`);
            console.log(`Driver: ${trip.driver?.user?.name || 'Unknown'}`);
            console.log(`Date: ${trip.date}`);
            console.log(`StartTime: ${trip.startTime}`);
            console.log(`Status: ${trip.status}`);
            console.log("-------------------");
        });

        if (activeTrips.length === 0) {
            console.log("No active trips found.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkDriverTrips();
