import { PaymentGateway, PaymentInitiationRequest, PaymentVerificationResult } from './types';

export class RazorpayGateway implements PaymentGateway {
    private keyId: string;
    private keySecret: string;
    private appUrl: string;

    constructor(keyId: string, keySecret: string, appUrl: string) {
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.appUrl = appUrl;
    }

    async initiatePayment(params: PaymentInitiationRequest): Promise<any> {
        try {
            const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');

            // 1. Create Order with Transfers (Split Logic)
            // Amount in Paise
            const totalAmount = Math.round(params.amount * 100);

            // Calculate Commission (e.g. 2.5% platform fee)
            // In production, fetch this from school record
            const platformFeePercent = params.commissionPercentage || 2.5;
            const platformFeeAmount = Math.round(totalAmount * (platformFeePercent / 100));
            const schoolShareAmount = totalAmount - platformFeeAmount;

            const transfers = [];
            if (params.subMerchantId) {
                transfers.push({
                    account: params.subMerchantId,
                    amount: schoolShareAmount,
                    currency: "INR",
                    notes: {
                        schoolId: params.schoolId,
                        studentId: params.studentId,
                        feeId: params.studentFeeId
                    },
                    linked_account_notes: ["schoolId"],
                    on_payment_success: true
                });
            }

            const payload: any = {
                amount: totalAmount,
                currency: params.currency || "INR",
                receipt: params.receiptNo,
                notes: {
                    studentId: params.studentId,
                    description: params.description
                }
            };

            if (transfers.length > 0) {
                payload.transfers = transfers;
            }

            const response = await fetch('https://api.razorpay.com/v1/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${auth}`
                },
                body: JSON.stringify(payload)
            });

            const order = await response.json();

            if (!response.ok) {
                console.error('Razorpay Order Error:', order);
                return { success: false, error: order.error?.description || "Order creation failed" };
            }

            // Return order details for frontend checkout
            return {
                success: true,
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: this.keyId,
                // These will be stored in FeePayment record
                platformFee: platformFeeAmount / 100,
                schoolShare: schoolShareAmount / 100
            };

        } catch (error: any) {
            console.error('Razorpay Initiation Failed:', error);
            return { success: false, error: error.message };
        }
    }

    async verifyPayment(transactionId: string): Promise<PaymentVerificationResult> {
        // Implement server-side verification with signature check
        // This is typically handled via webhook or manual fetch
        try {
            const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
            const response = await fetch(`https://api.razorpay.com/v1/payments/${transactionId}`, {
                headers: { 'Authorization': `Basic ${auth}` }
            });

            const payment = await response.json();

            return {
                success: response.ok && payment.status === 'captured',
                status: payment.status === 'captured' ? 'SUCCESS' : 'FAILED',
                transactionId: payment.id,
                rawResponse: payment
            };
        } catch (error: any) {
            return { success: false, status: 'FAILED', error: error.message };
        }
    }
}
