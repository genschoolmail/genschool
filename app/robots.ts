import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default function robots(): MetadataRoute.Robots {
    const headersList = headers();
    const host = headersList.get('host') || 'genschoolmail.in';
    const isLocalhost = host.includes('localhost');
    const protocol = isLocalhost ? 'http' : 'https';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/super-admin/',
                '/teacher/',
                '/student/',
                '/driver/',
                '/api/',
                '/_next/',
            ],
        },
        sitemap: `${protocol}://${host}/sitemap.xml`,
    };
}
