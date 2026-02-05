"use server";

/**
 * API Validation Functions
 * Test API keys before saving to ensure they are valid
 */

export async function validateGoogleMapsKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
    try {
        // Test with a simple geocoding request
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=${apiKey}`
        );

        const data = await response.json();

        if (data.status === 'OK') {
            return { valid: true, message: 'API key is valid and working' };
        } else if (data.status === 'REQUEST_DENIED') {
            return { valid: false, message: 'API key is invalid or restricted' };
        } else {
            return { valid: false, message: `API returned status: ${data.status}` };
        }
    } catch (error) {
        return { valid: false, message: 'Failed to validate API key: Network error' };
    }
}

export async function validatePaymentGatewayKey(apiKey: string, provider: string = 'razorpay'): Promise<{ valid: boolean; message: string }> {
    // This is a placeholder - actual implementation depends on payment provider
    // For Razorpay, you would make a test API call to fetch account details

    if (!apiKey || apiKey.length < 10) {
        return { valid: false, message: 'API key appears to be invalid (too short)' };
    }

    return { valid: true, message: 'Payment gateway key format is valid (full validation requires test transaction)' };
}

export async function validateSMSServiceKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
    // Placeholder for SMS service validation
    // Would depend on your SMS provider (Twilio, MSG91, etc.)

    if (!apiKey || apiKey.length < 10) {
        return { valid: false, message: 'API key appears to be invalid' };
    }

    return { valid: true, message: 'SMS service key format is valid' };
}

export async function validateEmailServiceKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
    // Placeholder for email service validation
    // Would depend on your provider (SendGrid, SES, etc.)

    if (!apiKey || apiKey.length < 10) {
        return { valid: false, message: 'API key appears to be invalid' };
    }

    return { valid: true, message: 'Email service key format is valid' };
}

export async function validateApiKey(provider: string, apiKey: string): Promise<{ valid: boolean; message: string }> {
    switch (provider) {
        case 'GOOGLE_MAPS':
            return validateGoogleMapsKey(apiKey);
        case 'PAYMENT_GATEWAY':
            return validatePaymentGatewayKey(apiKey);
        case 'SMS':
            return validateSMSServiceKey(apiKey);
        case 'EMAIL':
            return validateEmailServiceKey(apiKey);
        case 'STORAGE':
        case 'OTHER':
            return { valid: true, message: 'Validation not implemented for this provider' };
        default:
            return { valid: false, message: 'Unknown provider' };
    }
}
