import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getPublicSchool, getSubdomain } from '@/lib/tenant';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const headersList = headers();
    const host = headersList.get('host') || 'genschoolmail.in';
    const isLocalhost = host.includes('localhost');
    const protocol = isLocalhost ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Get school data if on a subdomain
    const subdomain = getSubdomain();
    let school = null;
    if (subdomain) {
        school = await getPublicSchool();
    }

    // Common routes for main domain
    if (!school) {
        return [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 1,
            },
            {
                url: `${baseUrl}/login`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.8,
            },
        ];
    }

    // Routes for school subdomains
    return [
        {
            url: baseUrl,
            lastModified: school.updatedAt ? new Date(school.updatedAt) : new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ];
}
