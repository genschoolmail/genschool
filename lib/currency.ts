/**
 * Currency formatting utilities for Indian Rupee (INR)
 * Uses Indian numbering system: 1,00,000 instead of 100,000
 */

export function formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

export function formatINRCompact(amount: number): string {
    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(2)} L`;
    } else if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(2)} K`;
    }
    return formatINR(amount);
}

export function parseINR(value: string): number {
    // Remove currency symbol and commas
    return parseFloat(value.replace(/[₹,]/g, ''));
}

export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';
