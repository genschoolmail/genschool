"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt, maskApiKey } from "./encryption";
import { validateApiKey } from "./api-validators";

export async function getApiKeys() {
    try {
        const keys = await prisma.apiKey.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Return keys with masked values for security
        return keys.map(key => ({
            ...key,
            key: maskApiKey(key.key, 4)
        }));
    } catch (error) {
        console.error("Error fetching API keys:", error);
        return [];
    }
}

export async function getApiKeyByProvider(provider: string) {
    try {
        const key = await prisma.apiKey.findFirst({
            where: {
                provider,
                isActive: true
            }
        });
        return key;
    } catch (error) {
        console.error("Error fetching API key:", error);
        return null;
    }
}

export async function createApiKey(data: {
    name: string;
    key: string;
    description?: string;
    provider: string;
    createdBy?: string;
}) {
    try {
        // Check if ENCRYPTION_SECRET is set
        if (!process.env.ENCRYPTION_SECRET) {
            console.error("ENCRYPTION_SECRET not set in environment variables");
            return {
                success: false,
                error: "Server configuration error: ENCRYPTION_SECRET not set. Please contact administrator."
            };
        }

        // Encrypt the API key before storing
        let encryptedKey;
        try {
            encryptedKey = encrypt(data.key);
        } catch (encryptError) {
            console.error("Encryption failed:", encryptError);
            return {
                success: false,
                error: "Failed to encrypt API key. Please contact administrator."
            };
        }

        // Validate the key before saving (optional but recommended)
        let validation;
        try {
            validation = await validateApiKey(data.provider, data.key);
        } catch (validationError) {
            console.error("Validation failed:", validationError);
            // Continue even if validation fails - we can still store the key
            validation = {
                valid: false,
                message: "Validation skipped due to error"
            };
        }

        // Create the API key in database
        await prisma.apiKey.create({
            data: {
                name: data.name,
                key: encryptedKey,
                description: data.description || null,
                provider: data.provider,
                createdBy: data.createdBy || null,
                status: validation.valid ? 'ACTIVE' : 'UNTESTED',
                testResult: JSON.stringify(validation)
            }
        });

        revalidatePath("/admin/settings/api-keys");
        return {
            success: true,
            message: validation.valid
                ? "API key added and validated successfully!"
                : "API key added successfully. Validation pending - you can test it manually."
        };
    } catch (error: any) {
        console.error("Error creating API key:", error);

        // Provide more specific error messages
        if (error.code === 'P2002') {
            return { success: false, error: "An API key with this name already exists" };
        }

        return {
            success: false,
            error: error.message || "Failed to create API key. Please try again."
        };
    }
}

export async function updateApiKey(id: string, data: {
    name?: string;
    key?: string;
    description?: string;
    isActive?: boolean;
}) {
    try {
        const updateData: any = {};

        if (data.name) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        // If key is being updated, encrypt it
        if (data.key) {
            updateData.key = encrypt(data.key);

            // Also re-validate
            const existing = await prisma.apiKey.findUnique({ where: { id } });
            if (existing) {
                const validation = await validateApiKey(existing.provider, data.key);
                updateData.status = validation.valid ? 'ACTIVE' : 'FAILED';
                updateData.testResult = JSON.stringify(validation);
                updateData.lastTested = new Date();
            }
        }

        await prisma.apiKey.update({
            where: { id },
            data: updateData
        });

        revalidatePath("/admin/settings/api-keys");
        return { success: true };
    } catch (error) {
        console.error("Error updating API key:", error);
        return { success: false, error: "Failed to update API key" };
    }
}

export async function deleteApiKey(id: string) {
    try {
        await prisma.apiKey.delete({
            where: { id }
        });
        revalidatePath("/admin/settings/api-keys");
        return { success: true };
    } catch (error) {
        console.error("Error deleting API key:", error);
        return { success: false, error: "Failed to delete API key" };
    }
}

export async function toggleApiKeyStatus(id: string) {
    try {
        const key = await prisma.apiKey.findUnique({ where: { id } });
        if (!key) return { success: false, error: "API key not found" };

        await prisma.apiKey.update({
            where: { id },
            data: { isActive: !key.isActive }
        });
        revalidatePath("/admin/settings/api-keys");
        return { success: true };
    } catch (error) {
        console.error("Error toggling API key status:", error);
        return { success: false, error: "Failed to toggle status" };
    }
}

export async function testApiKey(id: string) {
    try {
        const apiKey = await prisma.apiKey.findUnique({ where: { id } });
        if (!apiKey) {
            return { success: false, error: "API key not found" };
        }

        // Decrypt the key for testing
        const decryptedKey = decrypt(apiKey.key);

        // Validate the key
        const validation = await validateApiKey(apiKey.provider, decryptedKey);

        // Update test results
        await prisma.apiKey.update({
            where: { id },
            data: {
                status: validation.valid ? 'ACTIVE' : 'FAILED',
                testResult: JSON.stringify(validation),
                lastTested: new Date()
            }
        });

        revalidatePath("/admin/settings/api-keys");

        return {
            success: true,
            valid: validation.valid,
            message: validation.message
        };
    } catch (error) {
        console.error("Error testing API key:", error);
        return { success: false, error: "Failed to test API key" };
    }
}
