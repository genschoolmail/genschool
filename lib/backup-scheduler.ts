'use server'

import * as cron from 'node-cron'
import { PrismaClient } from '@prisma/client'
import { createBackup } from './backup-actions'

const prisma = new PrismaClient()

let scheduledTask: cron.ScheduledTask | null = null

/**
 * Initialize backup scheduler based on config
 */
export async function initializeBackupScheduler() {
    try {
        // Get backup config
        const config = await prisma.backupConfig.findFirst()

        if (!config || !config.autoBackupEnabled) {
            console.log('Auto backup is disabled')
            return { success: true, message: 'Auto backup is disabled' }
        }

        // Stop existing scheduled task if any
        if (scheduledTask) {
            scheduledTask.stop()
        }

        // Create cron expression based on frequency
        const cronExpression = getCronExpression(config.backupFrequency, config.backupTime || '02:00')

        // Schedule backup task
        scheduledTask = cron.schedule(cronExpression, async () => {
            console.log('Running scheduled backup...')
            await runScheduledBackup()
        })

        console.log(`Backup scheduler initialized: ${config.backupFrequency} at ${config.backupTime}`)
        return {
            success: true,
            message: `Scheduled backup initialized: ${config.backupFrequency}`,
            cronExpression,
        }
    } catch (error) {
        console.error('Error initializing backup scheduler:', error)
        return { success: false, message: 'Failed to initialize scheduler' }
    }
}

/**
 * Run scheduled backup
 */
export async function runScheduledBackup() {
    try {
        const config = await prisma.backupConfig.findFirst()

        if (!config) {
            return { success: false, message: 'No backup config found' }
        }

        // Create backup (using system user ID or first admin)
        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        })

        if (!admin) {
            return { success: false, message: 'No admin user found' }
        }

        const result = await createBackup(
            'FULL',
            admin.id,
            `Scheduled Backup - ${new Date().toLocaleString()}`,
            {
                encrypt: config.encryptionEnabled,
                compress: true,
                uploadToCloud: config.enableCloudStorage && config.autoSyncEnabled,
            }
        )

        // Update last auto backup time
        if (result.success) {
            await prisma.backupConfig.update({
                where: { id: config.id },
                data: { lastAutoBackup: new Date() },
            })
        }

        return result
    } catch (error) {
        console.error('Error running scheduled backup:', error)
        return { success: false, message: `Scheduled backup failed: ${error}` }
    }
}

/**
 * Stop scheduled backups
 */
export function stopBackupScheduler() {
    if (scheduledTask) {
        scheduledTask.stop()
        scheduledTask = null
        return { success: true, message: 'Backup scheduler stopped' }
    }
    return { success: false, message: 'No scheduled task running' }
}

/**
 * Get next scheduled backup time
 */
export async function getNextBackupTime() {
    try {
        const config = await prisma.backupConfig.findFirst()

        if (!config || !config.autoBackupEnabled) {
            return { success: false, message: 'Auto backup is disabled' }
        }

        // Calculate next run time based on frequency and time
        const now = new Date()
        const [hours, minutes] = (config.backupTime || '02:00').split(':').map(Number)

        let nextRun = new Date()
        nextRun.setHours(hours, minutes, 0, 0)

        switch (config.backupFrequency) {
            case 'HOURLY':
                nextRun = new Date(now.getTime() + 60 * 60 * 1000) // Next hour
                break

            case 'DAILY':
                if (nextRun <= now) {
                    nextRun.setDate(nextRun.getDate() + 1)
                }
                break

            case 'WEEKLY':
                if (nextRun <= now) {
                    nextRun.setDate(nextRun.getDate() + 7)
                }
                break

            case 'MONTHLY':
                if (nextRun <= now) {
                    nextRun.setMonth(nextRun.getMonth() + 1)
                }
                break
        }

        return {
            success: true,
            nextBackupTime: nextRun,
            frequency: config.backupFrequency,
        }
    } catch (error) {
        console.error('Error getting next backup time:', error)
        return { success: false, message: 'Failed to get next backup time' }
    }
}

/**
 * Helper: Convert frequency and time to cron expression
 */
function getCronExpression(frequency: string, time: string): string {
    const [hours, minutes] = time.split(':').map(Number)

    switch (frequency) {
        case 'HOURLY':
            return `${minutes} * * * *` // Every hour at specified minute

        case 'DAILY':
            return `${minutes} ${hours} * * *` // Every day at specified time

        case 'WEEKLY':
            return `${minutes} ${hours} * * 0` // Every Sunday at specified time

        case 'MONTHLY':
            return `${minutes} ${hours} 1 * *` // First day of month at specified time

        default:
            return `${minutes} ${hours} * * *` // Default to daily
    }
}

/**
 * Manually trigger scheduled backup
 */
export async function triggerManualScheduledBackup() {
    return await runScheduledBackup()
}
