
const { getStudents } = require('./lib/actions');
const { prisma } = require('./lib/prisma');

async function test() {
    try {
        console.log("Fetching students...");
        const students = await getStudents();
        console.log(`Successfully fetched ${students.length} students.`);
        if (students.length > 0) {
            console.log("First student:", students[0].user.name);
        }
    } catch (e) {
        console.error("Error fetching students:", e);
    }
}

test();
