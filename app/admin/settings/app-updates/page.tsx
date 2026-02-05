import React from 'react';
import { getCurrentAppVersion, getVersionHistory } from '@/lib/actions';
import AppVersionDisplay from './AppVersionDisplay';

export default async function AppUpdatesPage() {
    const [currentVersion, versionHistory] = await Promise.all([
        getCurrentAppVersion(),
        getVersionHistory(),
    ]);

    return <AppVersionDisplay currentVersion={currentVersion} versionHistory={versionHistory} />;
}
