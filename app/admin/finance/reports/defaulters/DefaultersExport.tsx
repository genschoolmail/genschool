"use client";

import { ExportButtons } from "@/components/ui/ExportButtons";

interface DefaultersExportProps {
    defaulters: any[];
}

export function DefaultersExport({ defaulters }: DefaultersExportProps) {
    const exportData = defaulters.map(d => ({
        name: d.student.user?.name || '',
        admissionNo: d.student.admissionNo,
        class: `${d.student.class?.name}-${d.student.class?.section}`,
        phone: d.student.user?.phone || '',
        parentPhone: d.student.parent?.user?.phone || '',
        pendingAmount: d.pendingAmount,
        feeCount: d.feeCount
    }));

    const columns = [
        { key: 'name', label: 'Student Name' },
        { key: 'admissionNo', label: 'Admission No' },
        { key: 'class', label: 'Class' },
        { key: 'phone', label: 'Phone' },
        { key: 'parentPhone', label: 'Parent Phone' },
        { key: 'pendingAmount', label: 'Pending Amount (₹)' },
        { key: 'feeCount', label: 'Overdue Fees' }
    ];

    return (
        <ExportButtons
            data={exportData}
            columns={columns}
            filename="fee_defaulters"
            printId="defaulters-list"
            printTitle="Fee Defaulters Report"
        />
    );
}
