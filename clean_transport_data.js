const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanData() {
    try {
        console.log("Starting cleanup...");

        // 1. Delete ALL Transport Attendance (Fresh Start)
        const deletedAttendance = await prisma.transportAttendance.deleteMany({});
        console.log(`Deleted ${deletedAttendance.count} total attendance records.`);

        // 2. Delete ALL Driver Trips (Fresh Start)
        const deletedTrips = await prisma.driverTrip.deleteMany({});
        console.log(`Deleted ${deletedTrips.count} total trip records.`);

        console.log("Cleanup Complete. You can now start a fresh trip.");

    } catch (error) {
        console.error("Error during cleanup:", error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanData();
