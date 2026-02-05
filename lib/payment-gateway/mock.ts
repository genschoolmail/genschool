import { PaymentGatewayAdapter, PaymentInitiationRequest, PaymentInitiationResponse, PaymentVerificationResult } from './types';

export class MockPaymentGateway implements PaymentGatewayAdapter {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
        // Create a transaction ID
        const transactionId = `MOCK-TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Construct the mock payment page URL
        // We pass details so the mock page can display them
        const params = new URLSearchParams({
            amount: request.amount.toString(),
            receiptNo: request.receiptNo,
            transactionId: transactionId,
            returnUrl: request.returnUrl,
            studentId: request.studentId,
            description: request.description
        });

        // Use absolute URL if possible, or relative
        const paymentUrl = `${this.baseUrl}/payment-gateway/mock?${params.toString()}`;

        return {
            success: true,
            paymentUrl,
            transactionId,
            orderId: `ORDER-${transactionId}`
        };
    }

    async verifyPayment(transactionId: string): Promise<PaymentVerificationResult> {
        // For mock, we can assume success OR check a DB if we were storing mock state.
        // But simplified: assume success if it looks like a valid mock ID.
        // Real implementation would call gateway API.

        return {
            success: true,
            status: 'SUCCESS',
            transactionId,
            amount: 0, // In real scenario, fetch from gateway
            rawResponse: { mock: true, verifiedAt: new Date().toISOString() }
        };
    }
}
