import { headers } from 'next/headers';
import { unstable_noStore as noStore } from 'next/cache';
import { prisma } from "@/lib/prisma";

export function getSubdomain() {
    try {
        const headersList = headers();
        const host = headersList.get('host') || '';

        let subdomain = '';
        if (host.includes('localhost')) {
            const parts = host.split('.');
            if (parts.length > 1) {
                subdomain = parts[0];
            }
        } else {
            // For production domains like school.com, acme.school.com -> acme
            const parts = host.split('.');
            if (parts.length > 2) {
                subdomain = parts[0];
            }
        }

        if (subdomain === 'www') return null;
        return subdomain || null; // Return null if no subdomain found
    } catch (error) {
        console.error("Error getting subdomain:", error);
        return null;
    }
}

import { cache } from 'react';

export const getPublicSchool = cache(async () => {
    noStore();
    const subdomain = getSubdomain();
    if (!subdomain) return null;

    try {
        const school = await prisma.school.findUnique({
            where: { subdomain },
            include: {
                config: true,
                schoolSettings: true,
            }
        });
        return school;
    } catch (error) {
        console.error("Error fetching public school:", error);
        return null;
    }
});

export async function ensureTenantId() {
    const subdomain = getSubdomain();

    // In development/localhost environments where subdomain might be tricky with some setups,
    // we can fallback to a default school if configured, OR just fail.
    // For now, let's try to find the school by subdomain.

    if (!subdomain) {
        // Fallback for root domain / main portal administration or initial setup
        // You might want to return a specific ID or null here depending on architectural choice.
        // For now, assume if no subdomain, we are likely in the platform admin or root context.
        // BUT, checking 'default' subdomain is a safe bet for development.
        const defaultSchool = await prisma.school.findUnique({ where: { subdomain: 'default' } });
        if (defaultSchool) return defaultSchool.id;

        throw new Error("Tenant context missing: No subdomain found");
    }

    const school = await prisma.school.findUnique({
        where: { subdomain },
        select: { id: true }
    });

    if (!school) {
        throw new Error(`Tenant not found for subdomain: ${subdomain}`);
    }

    return school.id;
}

// Alias for ensureTenantId - used in some components
export async function getTenantId() {
    return await ensureTenantId();
}