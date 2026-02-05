

import { prisma } from '@/lib/prisma';

/**
 * Academic Year Helper Functions
 * Manages academic year calculations and retrieval from school settings
 */

/**
 * Get current academic year from school settings
 * Format: "2024-25" or "2024-2025"
 * @returns Promise<string> Academic year
 */
export async function getCurrentAcademicYear(): Promise<string> {
    try {
        const settings = await prisma.schoolSettings.findFirst();

        /*
        if (settings?.academicYear) {
            // Normalize to "YYYY-YY" format
            const year = settings.academicYear;

            // If already in correct format (e.g., "2024-25")
            if (/^\d{4}-\d{2}$/.test(year)) {
                return year;
            }

            // If in full format (e.g., "2024-2025"), convert to short
            if (/^\d{4}-\d{4}$/.test(year)) {
                const parts = year.split('-');
                return `${parts[0]}-${parts[1].slice(2)}`;
            }

            return year;
        }
        */

        // Fallback: calculate from current date
        return calculateAcademicYear();
    } catch (error) {
        console.error('Error getting academic year:', error);
        return calculateAcademicYear();
    }
}

/**
 * Calculate academic year based on current date
 * Assumes academic year starts on April 1st
 * @returns string Academic year in "YYYY-YY" format
 */
function calculateAcademicYear(): string {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    // If current month is April or later, academic year is current-next
    // Otherwise, it's previous-current
    if (currentMonth >= 4) {
        const nextYear = (currentYear + 1).toString().slice(2);
        return `${currentYear}-${nextYear}`;
    } else {
        const prevYear = currentYear - 1;
        const currentShort = currentYear.toString().slice(2);
        return `${prevYear}-${currentShort}`;
    }
}

/**
 * Format academic year for display
 * @param year Academic year string
 * @returns Formatted string
 */
export function formatAcademicYear(year: string): string {
    if (/^\d{4}-\d{2}$/.test(year)) {
        const [start, end] = year.split('-');
        return `${start}-20${end}`;
    }
    return year;
}

/**
 * Check if a specific date falls within an academic year
 * @param date Date to check
 * @param academicYear Academic year string
 * @returns boolean
 */
export function isDateInAcademicYear(date: Date, academicYear: string): boolean {
    const [startYear] = academicYear.split('-').map(y =>
        y.length === 2 ? `20${y}` : y
    );

    const academicStart = new Date(parseInt(startYear), 3, 1); // April 1
    const academicEnd = new Date(parseInt(startYear) + 1, 2, 31); // March 31 next year

    return date >= academicStart && date <= academicEnd;
}
