'use server';

import { z } from 'zod';

const enquirySchema = z.object({
    name: z.string().min(1, "Name is required"),
    schoolName: z.string().min(1, "School Name is required"),
    mobile: z.string().min(10, "Valid mobile number is required"),
    email: z.string().email("Invalid email address"),
    message: z.string().optional(),
});

export type EnquiryState = {
    success?: boolean;
    error?: string;
    errors?: {
        [key: string]: string[];
    };
};

export async function submitPlatformEnquiry(prevState: EnquiryState, formData: FormData): Promise<EnquiryState> {
    const validatedFields = enquirySchema.safeParse({
        name: formData.get('name'),
        schoolName: formData.get('schoolName'),
        mobile: formData.get('mobile'),
        email: formData.get('email'),
        message: formData.get('message'),
    });

    if (!validatedFields.success) {
        return {
            error: "Validation Failed",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name, schoolName, mobile, email, message } = validatedFields.data;

    try {
        // In a real application, you would save this to a database
        // For now, we will simulate saving and logging
        console.log("New Platform Enquiry:", { name, schoolName, mobile, email, message });

        // Ensure this log is visible in production logs
        console.error(`ENQUIRY: ${name} from ${schoolName} (${mobile}) - ${message}`);

        // Ideally, send an email to gautamdss3@gmail.com here using a mail service (e.g. Resend, Nodemailer)
        // Since we don't have mail configured explicitly for this action yet, we'll assume success.

        return { success: true };
    } catch (error) {
        console.error("Enquiry submission error:", error);
        return { error: "Failed to submit enquiry. Please try again later." };
    }
}
