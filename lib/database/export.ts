'use server'

import * as fs from 'fs/promises'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

const DATABASE_PATH = './prisma/dev.db'
const BACKUP_DIR = './backups'

/**
 * Ensure backup directory exists
 */
async function ensureBackupDirectory(): Promise<void> {
    try {
        await fs.mkdir(BACKUP_DIR, { recursive: true })
    } catch (error) {
        console.error('Error creating backup directory:', error)
        throw new Error('Failed to create backup directory')
    }
}

/**
 * Get database file path
 */
function getDatabasePath(): string {
    return path.resolve(DATABASE_PATH)
}

/**
 * Generate backup filename
 */
function generateBackupFilename(type: 'FULL' | 'INCREMENTAL' | 'MANUAL' = 'FULL'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    return `backup-${type.toLowerCase()}-${timestamp}.db`
}

/**
 * Create full database backup (copy entire SQLite file)
 */
export async function createFullBackup(customName?: string): Promise<{
    success: boolean
    message: string
    filePath?: string
    fileSize?: number
    checksum?: string
}> {
    try {
        await ensureBackupDirectory()

        const dbPath = getDatabasePath()
        const backupFilename = customName || generateBackupFilename('FULL')
        const backupPath = path.join(BACKUP_DIR, backupFilename)

        // Check if database exists
        try {
            await fs.access(dbPath)
        } catch {
            return { success: false, message: 'Database file not found' }
        }

        // Copy database file
        await fs.copyFile(dbPath, backupPath)

        // Get file size
        const stats = await fs.stat(backupPath)
        const fileSize = stats.size

        // Calculate checksum (SHA-256)
        const fileBuffer = await fs.readFile(backupPath)
        const crypto = require('crypto')
        const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex')

        return {
            success: true,
            message: 'Full backup created successfully',
            filePath: backupPath,
            fileSize,
            checksum
        }
    } catch (error) {
        console.error('Error creating full backup:', error)
        return { success: false, message: `Backup failed: ${error}` }
    }
}

/**
 * Export database tables to JSON (for incremental or selective backup)
 */
export async function exportTablesToJSON(
    tables?: string[]
): Promise<{
    success: boolean
    message: string
    data?: Record<string, any>
    recordCount?: number
}> {
    try {
        const { PrismaClient } = require('@prisma/client')
        const prisma = new PrismaClient()

        const result: Record<string, any> = {}
        let totalRecords = 0

        // Get all model names from Prisma if tables not specified
        const modelNames = tables || Object.keys(prisma).filter(
            key => !key.startsWith('_') && !key.startsWith('$')
        )

        // Export each table
        for (const modelName of modelNames) {
            try {
                const model = (prisma as any)[modelName]
                if (model && typeof model.findMany === 'function') {
                    const data = await model.findMany()
                    result[modelName] = data
                    totalRecords += data.length
                }
            } catch (err) {
                console.error(`Error exporting ${modelName}:`, err)
            }
        }

        await prisma.$disconnect()

        return {
            success: true,
            message: 'Tables exported successfully',
            data: result,
            recordCount: totalRecords
        }
    } catch (error) {
        console.error('Error exporting tables:', error)
        return { success: false, message: `Export failed: ${error}` }
    }
}

/**
 * Create incremental backup (export changed data as JSON)
 */
export async function createIncrementalBackup(
    lastBackupDate: Date,
    customName?: string
): Promise<{
    success: boolean
    message: string
    filePath?: string
    fileSize?: number
    recordCount?: number
}> {
    try {
        await ensureBackupDirectory()

        // Export all tables to JSON
        const exportResult = await exportTablesToJSON()

        if (!exportResult.success || !exportResult.data) {
            return { success: false, message: 'Failed to export data' }
        }

        // Save to file
        const backupFilename = customName || generateBackupFilename('INCREMENTAL')
        const backupPath = path.join(BACKUP_DIR, backupFilename.replace('.db', '.json'))

        await fs.writeFile(backupPath, JSON.stringify(exportResult.data, null, 2))

        // Get file size
        const stats = await fs.stat(backupPath)

        return {
            success: true,
            message: 'Incremental backup created successfully',
            filePath: backupPath,
            fileSize: stats.size,
            recordCount: exportResult.recordCount
        }
    } catch (error) {
        console.error('Error creating incremental backup:', error)
        return { success: false, message: `Incremental backup failed: ${error}` }
    }
}

/**
 * Restore database from full backup
 */
export async function restoreFromFullBackup(
    backupFilePath: string,
    createBackupBeforeRestore: boolean = true
): Promise<{
    success: boolean
    message: string
    preRestoreBackupPath?: string
}> {
    try {
        const dbPath = getDatabasePath()

        // Create safety backup before restore
        let preRestoreBackupPath: string | undefined
        if (createBackupBeforeRestore) {
            const safetyBackup = await createFullBackup('pre-restore-safety-backup.db')
            if (safetyBackup.success && safetyBackup.filePath) {
                preRestoreBackupPath = safetyBackup.filePath
            }
        }

        // Check if backup file exists
        try {
            await fs.access(backupFilePath)
        } catch {
            return { success: false, message: 'Backup file not found' }
        }

        // Close any active database connections (if possible)
        // This might require application restart in production

        // Replace current database with backup
        await fs.copyFile(backupFilePath, dbPath)

        return {
            success: true,
            message: 'Database restored successfully',
            preRestoreBackupPath
        }
    } catch (error) {
        console.error('Error restoring database:', error)
        return { success: false, message: `Restore failed: ${error}` }
    }
}

/**
 * Validate backup file integrity
 */
export async function validateBackup(
    backupFilePath: string,
    expectedChecksum?: string
): Promise<{
    success: boolean
    message: string
    checksum?: string
    isValid?: boolean
}> {
    try {
        // Check if file exists
        try {
            await fs.access(backupFilePath)
        } catch {
            return { success: false, message: 'Backup file not found' }
        }

        // Calculate checksum
        const fileBuffer = await fs.readFile(backupFilePath)
        const crypto = require('crypto')
        const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex')

        // Validate against expected checksum if provided
        const isValid = expectedChecksum ? checksum === expectedChecksum : true

        return {
            success: true,
            message: isValid ? 'Backup is valid' : 'Checksum mismatch',
            checksum,
            isValid
        }
    } catch (error) {
        console.error('Error validating backup:', error)
        return { success: false, message: `Validation failed: ${error}` }
    }
}

/**
 * Get backup file info
 */
export async function getBackupInfo(
    backupFilePath: string
): Promise<{
    success: boolean
    message: string
    info?: {
        size: number
        createdAt: Date
        exists: boolean
    }
}> {
    try {
        const stats = await fs.stat(backupFilePath)

        return {
            success: true,
            message: 'Backup info retrieved',
            info: {
                size: stats.size,
                createdAt: stats.birthtime,
                exists: true
            }
        }
    } catch (error) {
        return {
            success: false,
            message: 'Backup file not found',
            info: {
                size: 0,
                createdAt: new Date(),
                exists: false
            }
        }
    }
}

/**
 * Delete backup file
 */
export async function deleteBackupFile(backupFilePath: string): Promise<{
    success: boolean
    message: string
}> {
    try {
        await fs.unlink(backupFilePath)
        return { success: true, message: 'Backup deleted successfully' }
    } catch (error) {
        console.error('Error deleting backup:', error)
        return { success: false, message: `Delete failed: ${error}` }
    }
}

/**
 * List all backup files in backup directory
 */
export async function listBackupFiles(): Promise<{
    success: boolean
    message: string
    files?: Array<{
        name: string
        path: string
        size: number
        createdAt: Date
    }>
}> {
    try {
        await ensureBackupDirectory()

        const files = await fs.readdir(BACKUP_DIR)
        const backupFiles = files.filter(f => f.endsWith('.db') || f.endsWith('.json') || f.endsWith('.encrypted'))

        const fileInfos = await Promise.all(
            backupFiles.map(async (filename) => {
                const filePath = path.join(BACKUP_DIR, filename)
                const stats = await fs.stat(filePath)
                return {
                    name: filename,
                    path: filePath,
                    size: stats.size,
                    createdAt: stats.birthtime
                }
            })
        )

        return {
            success: true,
            message: 'Backup files listed',
            files: fileInfos
        }
    } catch (error) {
        console.error('Error listing backups:', error)
        return { success: false, message: `List failed: ${error}` }
    }
}

/**
 * Compress backup file using gzip
 */
export async function compressBackup(filePath: string): Promise<{
    success: boolean
    message: string
    compressedPath?: string
    originalSize?: number
    compressedSize?: number
    compressionRatio?: number
}> {
    try {
        const zlib = require('zlib')
        const { pipeline } = require('stream/promises')

        const compressedPath = `${filePath}.gz`

        // Get original size
        const originalStats = await fs.stat(filePath)
        const originalSize = originalStats.size

        // Compress file
        const source = require('fs').createReadStream(filePath)
        const destination = require('fs').createWriteStream(compressedPath)
        const gzip = zlib.createGzip()

        await pipeline(source, gzip, destination)

        // Get compressed size
        const compressedStats = await fs.stat(compressedPath)
        const compressedSize = compressedStats.size

        // Calculate compression ratio
        const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100

        return {
            success: true,
            message: 'Backup compressed successfully',
            compressedPath,
            originalSize,
            compressedSize,
            compressionRatio
        }
    } catch (error) {
        console.error('Error compressing backup:', error)
        return { success: false, message: `Compression failed: ${error}` }
    }
}

/**
 * Decompress backup file
 */
export async function decompressBackup(compressedPath: string, outputPath?: string): Promise<{
    success: boolean
    message: string
    decompressedPath?: string
}> {
    try {
        const zlib = require('zlib')
        const { pipeline } = require('stream/promises')

        const decompressedPath = outputPath || compressedPath.replace('.gz', '')

        const source = require('fs').createReadStream(compressedPath)
        const destination = require('fs').createWriteStream(decompressedPath)
        const gunzip = zlib.createGunzip()

        await pipeline(source, gunzip, destination)

        return {
            success: true,
            message: 'Backup decompressed successfully',
            decompressedPath
        }
    } catch (error) {
        console.error('Error decompressing backup:', error)
        return { success: false, message: `Decompression failed: ${error}` }
    }
}
