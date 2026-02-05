'use client';

import { useState } from 'react';
import { NoticeCard, PortalNoticeModal } from '@/components/ui/notice-components';

interface NoticeListClientProps {
    notices: any[];
}

export default function NoticeListClient({ notices }: NoticeListClientProps) {
    const [selectedNotice, setSelectedNotice] = useState<any>(null);

    return (
        <>
            <div className="grid gap-4">
                {notices.map((notice: any) => (
                    <NoticeCard
                        key={notice.id}
                        notice={notice}
                        onClick={() => setSelectedNotice(notice)}
                    />
                ))}
            </div>

            {selectedNotice && (
                <PortalNoticeModal
                    notice={selectedNotice}
                    onClose={() => setSelectedNotice(null)}
                />
            )}
        </>
    );
}
