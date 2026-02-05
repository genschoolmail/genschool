"use client";

import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { exportToCSV, exportToExcel, printContent } from "@/lib/export-utils";

interface ExportButtonsProps {
    data: any[];
    columns: { key: string; label: string }[];
    filename: string;
    printId?: string;
    printTitle?: string;
}

export function ExportButtons({ data, columns, filename, printId, printTitle }: ExportButtonsProps) {
    return (
        <div className="flex gap-2 flex-wrap">
            <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(data, filename, columns)}
                className="gap-2"
            >
                <Download className="h-4 w-4" />
                CSV
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => exportToExcel(data, filename, columns)}
                className="gap-2"
            >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
            </Button>
            {printId && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => printContent(printId, printTitle)}
                    className="gap-2"
                >
                    <Printer className="h-4 w-4" />
                    Print
                </Button>
            )}
        </div>
    );
}
