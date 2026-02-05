import { getWebsiteConfig } from '@/lib/cms-actions';
import { ensureTenantId } from '@/lib/tenant';
import { prisma } from '@/lib/prisma';
import UnifiedWebsiteSettings from './UnifiedWebsiteSettings';

export default async function WebsiteCMSPage() {
    const schoolId = await ensureTenantId();
    const config = await getWebsiteConfig(schoolId);

    // Fetch School Subdomain for Preview
    const school = await prisma.school.findUnique({
        where: { id: schoolId },
        select: { subdomain: true }
    });

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 dark:text-white">Website Builder</h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Manage your public school website, notice board, and gallery from one place.
                </p>
            </div>

            <UnifiedWebsiteSettings
                initialConfig={config}
                subdomain={school?.subdomain || 'default'}
            />
        </div>
    );
}
