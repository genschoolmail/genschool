export interface PaymentInitiationRequest {
    amount: number;
    currency: string;
    receiptNo: string;
    studentId: string;
    schoolId: string;
    studentFeeId: string;
    description: string;
    returnUrl: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    // Marketplace / Split Payment Fields
    subMerchantId?: string;
    commissionPercentage?: number;
    metadata?: Record<string, string>;
}

export interface PaymentInitiationResponse {
    success: boolean;
    paymentUrl?: string; // Redirect URL
    orderId?: string;    // Razorpay Order ID
    transactionId?: string;
    platformFee?: number;
    schoolShare?: number;
    error?: string;
}

export interface PaymentVerificationResult {
    success: boolean;
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
    transactionId: string;
    amount?: number;
    rawResponse?: any;
    error?: string;
}

export interface PaymentGateway {
    initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse>;
    verifyPayment(transactionId: string): Promise<PaymentVerificationResult>;
}
