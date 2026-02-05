'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateIncomeReport, generateExpenseReport, ReportData } from '@/lib/report-actions';

export default function ExportButton({ type }: { type: 'INCOME' | 'EXPENSE' }) {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            // When exporting from a Module List, usually we want "All Data currently in view" or "All Data for Current Year".
            // Since `generateReport` actions accept dates, let's default to "Current Active Year" range or "This Month" depending on requirement.
            // User said "Start Academic Year...".
            // Ideally, we should fetch "All Time" (which is actually scoped to Academic Year via DB relation now? No, we haven't filtered everything by default yet).
            // But `generateReport` takes Date Range.
            // Let's modify `generateReport` to accept OPTIONAL dates, and if missing, fetch ALL (scoped to current year via logic).

            // For now, let's just fetch "This Year" roughly?
            // Better: Let's use a very wide range, or update server action to handle "All".
            const start = new Date('2000-01-01'); // Far past
            const end = new Date(); // Today

            let data: ReportData[] = [];
            if (type === 'INCOME') {
                data = await generateIncomeReport(start, end);
            } else {
                data = await generateExpenseReport(start, end);
            }

            if (data.length === 0) {
                toast.error("No data available to export");
                setLoading(false);
                return;
            }

            // Convert to CSV
            const headers = ['Date', 'Category', 'Description', 'Amount', 'Status', 'Reference', 'Payment Method'];
            const csvContent = [
                headers.join(','),
                ...data.map(row => [
                    new Date(row.date).toLocaleDateString('en-IN'),
                    `"${row.category}"`,
                    `"${row.description.replace(/"/g, '""')}"`,
                    row.amount,
                    row.status,
                    row.reference || '',
                    row.paymentMethod || ''
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${type}_EXPORT_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Export successful!");
        } catch (error) {
            console.error(error);
            toast.error("Export failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export CSV
        </button>
    );
}
