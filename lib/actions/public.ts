'use server'

import prisma from "@/lib/prisma";

export async function submitAdmissionEnquiry(formData: FormData) {
    const schoolId = formData.get('schoolId') as string;
    const name = formData.get('studentName') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const studentClass = formData.get('class') as string;
    const message = formData.get('message') as string;

    if (!schoolId || !name || !phone) {
        return { success: false, message: "Missing required fields" };
    }

    try {
        await prisma.admissionEnquiry.create({
            data: {
                schoolId,
                name,
                phone,
                email: email || null,
                class: studentClass || null,
                message: message || null
            }
        });

        return { success: true, message: "Enquiry submitted successfully!" };
    } catch (error) {
        console.error("Error submitting enquiry:", error);
        return { success: false, message: "Failed to submit enquiry" };
    }
}
