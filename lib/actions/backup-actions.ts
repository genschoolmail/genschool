'use server';

export async function triggerManualBackup() {
    // Mock backup trigger
    return { success: true, message: "Backup started successfully" };
}

export async function fetchBackups() {
    return [
        { id: '1', date: new Date().toISOString(), size: '150MB', status: 'COMPLETED' }
    ];
}
