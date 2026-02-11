import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://successmission.genschoolmail.in';

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
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
