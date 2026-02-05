'use server'

import { PrismaClient } from '@prisma/client'
import { createFullBackup, createIncrementalBackup, restoreFromFullBackup, validateBackup, compressBackup, decompressBackup } from './database/export'
import { encrypt, decrypt, encryptFile, decryptFile, initializeEncryption, getKeyHash } from './encryption'
import * as fs from 'fs/promises'
import * as path from 'path'

const prisma = new PrismaClient()

/**
 * Initialize backup configuration
 */
export async function initializeBackupConfig() {
    try {
        // Check if config already exists
        const existing = await prisma.backupConfig.findFirst()

        if (existing) {
            return { success: true, message: 'Backup config already initialized', config: existing }
        }

        // Initialize encryption
        await initializeEncryption()
        const keyHash = await getKeyHash()

        // Create default config
        const config = await prisma.backupConfig.create({
            data: {
                encryptionKeyHash: keyHash || undefined,
                encryptionInitialized: !!keyHash,
            }
        })

        return { success: true, message: 'Backup config initialized', config }
    } catch (error) {
        console.error('Error initializing backup config:', error)
        return { success: false, message: 'Failed to initialize backup config' }
    }
}

/**
 * Get backup configuration
 */
export async function getBackupConfig() {
    try {
        let config = await prisma.backupConfig.findFirst()

        if (!config) {
            const initResult = await initializeBackupConfig()
            config = initResult.config || null
        }

        return { success: true, config }
    } catch (error) {
        console.error('Error getting backup config:', error)
        return { success: false, message: 'Failed to get backup config' }
    }
}

/**
 * Update backup configuration
 */
export async function updateBackupConfig(data: any, userId: string) {
    try {
        const config = await prisma.backupConfig.findFirst()

        if (!config) {
            return { success: false, message: 'Backup config not initialized' }
        }

        const updated = await prisma.backupConfig.update({
            where: { id: config.id },
            data: {
                ...data,
                updatedBy: userId,
            }
        })

        return { success: true, message: 'Backup config updated', config: updated }
    } catch (error) {
        console.error('Error updating backup config:', error)
        return { success: false, message: 'Failed to update backup config' }
    }
}

/**
 * Create a backup (Full, Incremental, or Manual)
 */
export async function createBackup(
    type: 'FULL' | 'INCREMENTAL' | 'MANUAL',
    userId: string,
    customName?: string,
    options?: {
        encrypt?: boolean
        compress?: boolean
        uploadToCloud?: boolean
    }
) {
    const backupName = customName || `Backup ${new Date().toLocaleDateString()}`

    try {
        // Get config
        const configResult = await getBackupConfig()
        if (!configResult.success || !configResult.config) {
            return { success: false, message: 'Backup config not found' }
        }
        const config = configResult.config

        // Create backup record
        const backupRecord = await prisma.backupRecord.create({
            data: {
                name: backupName,
                type,
                status: 'IN_PROGRESS',
                createdBy: userId,
                isEncrypted: options?.encrypt ?? config.encryptionEnabled,
                isCompressed: options?.compress ?? true,
            }
        })

        try {
            // Create database backup
            let backupResult
            if (type === 'FULL' || type === 'MANUAL') {
                backupResult = await createFullBackup()
            } else {
                backupResult = await createIncrementalBackup(new Date(Date.now() - 24 * 60 * 60 * 1000))
            }

            if (!backupResult.success || !backupResult.filePath) {
                throw new Error(backupResult.message)
            }

            let finalPath = backupResult.filePath
            let fileSize = backupResult.fileSize || 0
            let originalSize = fileSize

            // Compress if enabled
            if (options?.compress ?? true) {
                const compressResult = await compressBackup(finalPath)
                if (compressResult.success && compressResult.compressedPath) {
                    finalPath = compressResult.compressedPath
                    fileSize = compressResult.compressedSize || fileSize
                    originalSize = compressResult.originalSize || originalSize

                    // Update record with compression info
                    await prisma.backupRecord.update({
                        where: { id: backupRecord.id },
                        data: {
                            originalSize: BigInt(originalSize),
                            compressionRatio: compressResult.compressionRatio || 0,
                        }
                    })
                }
            }

            // Encrypt if enabled
            if (options?.encrypt ?? config.encryptionEnabled) {
                const encryptResult = await encryptFile(finalPath)
                if (encryptResult.success && encryptResult.encryptedPath) {
                    // Delete unencrypted file
                    await fs.unlink(finalPath)
                    finalPath = encryptResult.encryptedPath

                    // Update file size after encryption
                    const stats = await fs.stat(finalPath)
                    fileSize = stats.size
                }
            }

            // Calculate checksum
            const fileBuffer = await fs.readFile(finalPath)
            const crypto = require('crypto')
            const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex')

            // Get table count (estimate)
            const tableCount = type === 'INCREMENTAL' ? (backupResult as any).recordCount || 0 : await getTableCount()

            // Update backup record
            await prisma.backupRecord.update({
                where: { id: backupRecord.id },
                data: {
                    status: 'COMPLETED',
                    fileName: path.basename(finalPath),
                    filePath: finalPath,
                    fileSize: BigInt(fileSize),
                    checksum,
                    recordCount: tableCount,
                    storedLocally: true,
                    completedAt: new Date(),
                    duration: Math.floor((Date.now() - backupRecord.startedAt.getTime()) / 1000),
                }
            })

            return {
                success: true,
                message: 'Backup created successfully',
                backupId: backupRecord.id,
                filePath: finalPath,
            }
        } catch (error) {
            // Update record with error
            await prisma.backupRecord.update({
                where: { id: backupRecord.id },
                data: {
                    status: 'FAILED',
                    errorMessage: String(error),
                    completedAt: new Date(),
                }
            })

            throw error
        }
    } catch (error) {
        console.error('Error creating backup:', error)
        return { success: false, message: `Backup failed: ${error}` }
    }
}

/**
 * Get backup list with filters
 */
export async function getBackupList(filters?: {
    type?: string
    status?: string
    limit?: number
}) {
    try {
        const backups = await prisma.backupRecord.findMany({
            where: {
                ...(filters?.type && { type: filters.type }),
                ...(filters?.status && { status: filters.status }),
            },
            orderBy: { startedAt: 'desc' },
            take: filters?.limit || 50,
        })

        return { success: true, backups }
    } catch (error) {
        console.error('Error getting backup list:', error)
        return { success: false, message: 'Failed to get backup list' }
    }
}

/**
 * Get backup by ID
 */
export async function getBackupById(backupId: string) {
    try {
        const backup = await prisma.backupRecord.findUnique({
            where: { id: backupId },
        })

        if (!backup) {
            return { success: false, message: 'Backup not found' }
        }

        return { success: true, backup }
    } catch (error) {
        console.error('Error getting backup:', error)
        return { success: false, message: 'Failed to get backup' }
    }
}

/**
 * Restore from backup
 */
export async function restoreFromBackup(
    backupId: string,
    userId: string,
    options?: {
        createSafetyBackup?: boolean
    }
) {
    try {
        // Get backup record
        const backupResult = await getBackupById(backupId)
        if (!backupResult.success || !backupResult.backup) {
            return { success: false, message: 'Backup not found' }
        }

        const backup = backupResult.backup

        if (!backup.filePath) {
            return { success: false, message: 'Backup file path not found' }
        }

        // Create restore record
        const restoreRecord = await prisma.restoreRecord.create({
            data: {
                backupRecordId: backupId,
                type: 'FULL',
                status: 'IN_PROGRESS',
                performedBy: userId,
                createBackupBeforeRestore: options?.createSafetyBackup ?? true,
            }
        })

        try {
            let filePath = backup.filePath

            // Decrypt if encrypted
            if (backup.isEncrypted) {
                const decryptResult = await decryptFile(filePath)
                if (!decryptResult.success || !decryptResult.decryptedPath) {
                    throw new Error('Decryption failed')
                }
                filePath = decryptResult.decryptedPath
            }

            // Decompress if compressed
            if (backup.isCompressed && filePath.endsWith('.gz')) {
                const decompressResult = await decompressBackup(filePath)
                if (!decompressResult.success || !decompressResult.decompressedPath) {
                    throw new Error('Decompression failed')
                }
                filePath = decompressResult.decompressedPath
            }

            // Validate backup
            if (backup.checksum) {
                const validationResult = await validateBackup(filePath, backup.checksum)
                if (!validationResult.success || !validationResult.isValid) {
                    throw new Error('Backup validation failed')
                }
            }

            // Create safety backup before restore
            let preRestoreBackupId: string | undefined
            if (options?.createSafetyBackup ?? true) {
                const safetyBackup = await createBackup('MANUAL', userId, 'Pre-Restore Safety Backup', {
                    encrypt: true,
                    compress: true,
                })
                if (safetyBackup.success) {
                    preRestoreBackupId = safetyBackup.backupId
                }
            }

            // Perform restore
            const restoreResult = await restoreFromFullBackup(filePath, options?.createSafetyBackup ?? true)

            if (!restoreResult.success) {
                throw new Error(restoreResult.message)
            }

            // Update restore record
            await prisma.restoreRecord.update({
                where: { id: restoreRecord.id },
                data: {
                    status: 'COMPLETED',
                    validationPassed: true,
                    preRestoreBackupId,
                    completedAt: new Date(),
                    duration: Math.floor((Date.now() - restoreRecord.startedAt.getTime()) / 1000),
                }
            })

            return {
                success: true,
                message: 'Restore completed successfully. Please restart the application.',
                restoreId: restoreRecord.id,
            }
        } catch (error) {
            // Update record with error
            await prisma.restoreRecord.update({
                where: { id: restoreRecord.id },
                data: {
                    status: 'FAILED',
                    errorMessage: String(error),
                    completedAt: new Date(),
                }
            })

            throw error
        }
    } catch (error) {
        console.error('Error restoring backup:', error)
        return { success: false, message: `Restore failed: ${error}` }
    }
}

/**
 * Delete a backup
 */
export async function deleteBackup(backupId: string) {
    try {
        const backup = await prisma.backupRecord.findUnique({
            where: { id: backupId },
        })

        if (!backup) {
            return { success: false, message: 'Backup not found' }
        }

        // Delete file if exists
        if (backup.filePath) {
            try {
                await fs.unlink(backup.filePath)
            } catch (err) {
                console.error('Error deleting backup file:', err)
            }
        }

        // Delete record
        await prisma.backupRecord.delete({
            where: { id: backupId },
        })

        return { success: true, message: 'Backup deleted successfully' }
    } catch (error) {
        console.error('Error deleting backup:', error)
        return { success: false, message: 'Failed to delete backup' }
    }
}

/**
 * Get backup statistics
 */
export async function getBackupStats() {
    try {
        const totalBackups = await prisma.backupRecord.count()
        const completedBackups = await prisma.backupRecord.count({
            where: { status: 'COMPLETED' }
        })
        const failedBackups = await prisma.backupRecord.count({
            where: { status: 'FAILED' }
        })

        const lastBackup = await prisma.backupRecord.findFirst({
            where: { status: 'COMPLETED' },
            orderBy: { completedAt: 'desc' }
        })

        // Calculate total storage used
        const allBackups = await prisma.backupRecord.findMany({
            where: { status: 'COMPLETED' },
            select: { fileSize: true }
        })

        const totalStorage = allBackups.reduce((sum, b) => sum + Number(b.fileSize || 0), 0)

        return {
            success: true,
            stats: {
                totalBackups,
                completedBackups,
                failedBackups,
                lastBackup,
                totalStorage,
            }
        }
    } catch (error) {
        console.error('Error getting backup stats:', error)
        return { success: false, message: 'Failed to get backup stats' }
    }
}

/**
 * Helper: Get approximate table count
 */
async function getTableCount(): Promise<number> {
    try {
        // Count records across main tables
        const counts = await Promise.all([
            prisma.user.count(),
            prisma.student.count(),
            prisma.teacher.count(),
            prisma.class.count(),
        ])

        return counts.reduce((sum, count) => sum + count, 0)
    } catch (error) {
        return 0
    }
}
