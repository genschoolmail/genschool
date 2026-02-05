'use client';

export default function ReceiptPrintStyles() {
    return (
        <style jsx global>{`
            @media print {
                @page { 
                    size: A4; 
                    margin: 15mm 10mm;
                }
                
                body { 
                    -webkit-print-color-adjust: exact !important; 
                    print-color-adjust: exact !important; 
                    background: white !important; 
                    margin: 0 !important;
                    padding: 0 !important;
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
                    border:none !important;
                    box-shadow: none !important;
                }

                /* Optimize receipt card for print */
                div[class*="bg-white"], .receipt-container {
                    width: 100% !important;
                    max-width: 100% !important;
                    border: 2px solid #000 !important;
                    border-radius: 0 !important;
                    box-shadow: none !important;
                    page-break-inside: avoid !important;
                    margin: 0 !important;
                    padding: 15mm !important;
                }

                /* Typography adjustments for print */
                h1, h2 { font-size: 18pt !important; }
                h3 { font-size: 14pt !important; }
                p, td, th, span { font-size: 10pt !important; }
                small { font-size: 8pt !important; }

                /* Table optimization */
                table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    margin: 10mm 0 !important;
                }
                
                th, td {
                    padding: 2mm 3mm !important;
                    border: 1px solid #333 !important;
                }

                /* Prevent orphans */
                tr { page-break-inside: avoid !important; }
                thead { display: table-header-group !important; }
                
                /* Ensure colors print */
                .bg-green-50, .bg-blue-50, .bg-purple-50 {
                    print-color-adjust: exact !important;
                }
            }

            /* Mobile optimizations */
            @media (max-width: 640px) {
                .receipt-container {
                    padding: 1rem !important;
                    margin: 0.5rem !important;
                }
                
                table {
                    font-size: 12px !important;
                }
                
                th, td {
                    padding: 0.5rem 0.25rem !important;
                }
                
                h1 { font-size: 1.5rem !important; }
                h2 { font-size: 1.25rem !important; }
                h3 { font-size: 1.125rem !important; }
            }
        `}</style>
    );
}
