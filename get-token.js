const { PrismaClient } = require('@prisma/client');
const { createHmac } = require('crypto');
const prisma = new PrismaClient();

const SECRET = "super_secret_auth_secret_must_be_long_enough";

async function main() {
    const user = await prisma.user.findFirst({
        where: { email: 'sweatpllv@gmail.com' }
    });

    if (!user) {
        console.log("User not found");
        return;
    }

    console.log("Found User ID:", user.id);

    const timestamp = Date.now();
    const payload = `${user.id}:${timestamp}`;
    const signature = createHmac('sha256', SECRET).update(payload).digest('hex');
    const token = `${payload}:${signature}`;

    console.log("IMPERSONATION_TOKEN=" + token);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
