"use server";

import { prisma } from "@/lib/prisma";
import { decrypt } from "./encryption";

/**
 * Centralized API Service
 * Single source of truth for all third-party API integrations
 */

export async function getApiKey(provider: string): Promise<string | null> {
    try {
        const apiKey = await prisma.apiKey.findFirst({
            where: {
                provider,
                isActive: true
            }
        });

        if (!apiKey) {
            console.warn(`No active API key found for provider: ${provider}`);
            return null;
        }

        // Decrypt the key before returning
        try {
            return decrypt(apiKey.key);
        } catch (error) {
            console.error(`Failed to decrypt API key for ${provider}:`, error);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching API key for ${provider}:`, error);
        return null;
    }
}

export async function getGoogleMapsApiKey(): Promise<string | null> {
    return getApiKey('GOOGLE_MAPS');
}

export async function getPaymentGatewayApiKey(): Promise<string | null> {
    return getApiKey('PAYMENT_GATEWAY');
}

export async function getSMSServiceApiKey(): Promise<string | null> {
    return getApiKey('SMS');
}

export async function getEmailServiceApiKey(): Promise<string | null> {
    return getApiKey('EMAIL');
}

export async function getStorageApiKey(): Promise<string | null> {
    return getApiKey('STORAGE');
}

/**
 * Check if a specific API provider is configured
 */
export async function isApiConfigured(provider: string): Promise<boolean> {
    const key = await getApiKey(provider);
    return key !== null;
}

/**
 * Get all configured API providers
 */
export async function getConfiguredProviders(): Promise<string[]> {
    try {
        const keys = await prisma.apiKey.findMany({
            where: { isActive: true },
            select: { provider: true }
        });
        return keys.map(k => k.provider);
    } catch (error) {
        console.error("Error fetching configured providers:", error);
        return [];
    }
}
