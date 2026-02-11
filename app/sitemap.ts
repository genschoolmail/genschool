import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default function sitemap(): MetadataRoute.Sitemap {
    const headersList = headers();
    const domain = headersList.get('host') || '';
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${domain}`;

    // Common routes for all domains
    const routes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
    ];

    // You can add logic here to fetch dynamic routes based on subdomain
    // For example, if it's a school subdomain, you might want to add specific public pages if they exist separately.
    // Currently, the school landing page is a single page application within Home.

    return routes;
}
