import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'superadmin@school.com'
    const password = 'password123'
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'SUPER_ADMIN',
        },
        create: {
            email,
            name: 'Super Admin',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
        },
    })

    console.log(`Created/Updated Super Admin: ${user.email} with password: ${password}`)

    // Ensure default school exists
    const defaultSchool = await prisma.school.upsert({
        where: { subdomain: 'demo' },
        update: {},
        create: {
            name: 'Demo School',
            subdomain: 'demo',
            contactEmail: 'demo@school.com',
        }
    })
    console.log('Default school checked/created:', defaultSchool.name)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
