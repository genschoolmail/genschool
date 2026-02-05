'use client';

export default function ReceiptPrintStyles() {
    return (
        <style jsx global>{`
            @media print {
                @page { 
                    size: A4; 
                    margin: 10mm;
                }
                
                body { 
                    -webkit-print-color-adjust: exact !important; 
                    print-color-adjust: exact !important; 
                    zoom: 0.8 !important; /* Scale down to fit */
                }
                
                /* Hide UI elements */
                header, nav, aside, .no-print, .sidebar, .navbar, 
                [role="navigation"], #sidebar, #navbar, 
                button:not(.print-visible) { 
                    display: none !important; 
                }
                
                /* Reset layout */
                main, div[class*="max-w-"], .container { 
                    width: 100% !important; 
                    max-width: none !important; 
                    margin: 0 !important; 
                    padding: 0 !important; 
                    border: none !important;
                    box-shadow: none !important;
                }

                /* Receipt Container - Clean White Look */
                .receipt-container {
                    width: 100% !important;
                    max-width: 100% !important;
                    box-shadow: none !important;
                    border: 1px solid #000 !important; /* Simple black border for print */
                    border-radius: 4px !important;
                    margin: 0 !important;
                    page-break-inside: avoid !important;
                    background-color: white !important;
                }

                /* Force backgrounds to WHITE for print economy, except specific headers if needed - RELAXED for Mobile Watermark support */
                /* .bg-slate-50, .bg-slate-100, .bg-green-50, .bg-orange-50, .bg-red-50, .bg-indigo-50, .bg-indigo-100 { 
                    background-color: white !important; 
                    border: 1px solid #eee !important; 
                } */
                
                /* Ensure text is black/dark grey for readability - RELAXED */
                /* .text-indigo-600, .text-slate-800, .text-slate-600, .text-slate-500, 
                .text-green-600, .text-orange-600, .text-red-600 { 
                    color: black !important; 
                } */

                /* Fix Table */
                table {
                    width: 100% !important;
                    page-break-inside: auto;
                }
                
                tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                }

                /* Compact spacing */
                .p-4, .p-6 {
                    padding: 10px !important;
                }
                .gap-4 {
                    gap: 5px !important;
                }
            }
        `}</style>
    );
}
