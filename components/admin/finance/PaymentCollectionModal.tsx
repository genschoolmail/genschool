"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Printer, X, Download, Wallet, Loader2, AlertCircle, IndianRupee } from "lucide-react";
import { getStudentPendingFees, collectFees, PendingFee } from "@/lib/fee-collection-actions";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface PaymentCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    fee: any; // Initial fee context, used to get studentId
    onSuccess: () => void;
    currentUser: any;
}

export default function PaymentCollectionModal({ isOpen, onClose, fee, onSuccess, currentUser }: PaymentCollectionModalProps) {
    const [pendingFees, setPendingFees] = useState<PendingFee[]>([]);
    const [selectedFeeIds, setSelectedFeeIds] = useState<string[]>([]);
    const [method, setMethod] = useState("");
    const [reference, setReference] = useState("");
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [successData, setSuccessData] = useState<any>(null);

    const studentId = fee?.studentId || fee?.student?.id;

    // Fetch all pending fees for this student when modal opens
    useEffect(() => {
        if (isOpen && studentId) {
            setFetching(true);
            getStudentPendingFees(studentId)
                .then(fees => {
                    setPendingFees(fees);
                    // Default select the fee that triggered the modal
                    const initialCustomAmounts: { [key: string]: number } = {};
                    fees.forEach(f => {
                        initialCustomAmounts[f.id] = f.pendingAmount; // Default to full pending
                    });
                    setCustomAmounts(initialCustomAmounts);

                    if (fee?.id) {
                        const exists = fees.find(f => f.id === fee.id);
                        if (exists) setSelectedFeeIds([fee.id]);
                        else setSelectedFeeIds([]);
                    }
                })
                .catch(err => toast.error("Failed to load fees"))
                .finally(() => setFetching(false));
        }
    }, [isOpen, studentId, fee?.id]);

    const handleToggleFee = (feeId: string) => {
        setSelectedFeeIds(prev =>
            prev.includes(feeId) ? prev.filter(id => id !== feeId) : [...prev, feeId]
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedFeeIds(pendingFees.map(f => f.id));
        } else {
            setSelectedFeeIds([]);
        }
    };

    // State to track custom payment amounts for each fee
    const [customAmounts, setCustomAmounts] = useState<{ [key: string]: number | string }>({});

    // Calculate totals based on selection and custom amounts
    const selectedFees = pendingFees.filter(f => selectedFeeIds.includes(f.id));
    const totalAmountToPay = selectedFees.reduce((sum, f) => {
        const val = customAmounts[f.id];
        const amount = (val !== undefined && val !== '') ? Number(val) : f.pendingAmount;
        return sum + amount;
    }, 0);

    const handleSubmit = async () => {
        if (selectedFeeIds.length === 0) {
            toast.error("Please select at least one fee to pay");
            return;
        }

        if (!method) {
            toast.error("Please select a Payment Mode");
            return;
        }

        setLoading(true);

        try {
            const feesToPay = selectedFees.map(f => {
                const val = customAmounts[f.id];
                return {
                    studentFeeId: f.id,
                    amount: (val !== undefined && val !== '') ? Number(val) : f.pendingAmount
                };
            });

            const result = await collectFees({
                studentId,
                feesToPay,
                method,
                reference,
                remarks,
                collectedBy: currentUser?.name || "Admin"
            });

            if (result.success) {
                toast.success("Payment collected successfully!");
                setSuccessData({
                    receiptNo: result.receiptNo,
                    date: result.date,
                    totalPaid: result.totalPaid,
                    advanceAmount: result.advanceAmount,
                    totalReceived: result.totalReceived,
                    walletBalance: result.walletBalance,
                    method,
                    reference,
                    items: selectedFees.map(f => {
                        const val = customAmounts[f.id];
                        return {
                            name: f.feeStructure.name,
                            amount: (val !== undefined && val !== '') ? Number(val) : f.pendingAmount
                        };
                    }),
                    student: fee.student || result.student // Pass student info
                });
            } else {
                toast.error(result.error || "Failed to collect payment");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        if (!successData) return;

        const printContent = `
            <html>
                <head>
                    <title>Fee Receipt - ${successData.receiptNo}</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0; color: #1e293b; background: white; }
                        .receipt-container { max-width: 800px; margin: 0 auto; padding: 40px; }
                        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
                        .school-name { font-size: 24px; font-weight: 800; color: #1e293b; margin: 0; }
                        .school-info { font-size: 14px; color: #64748b; margin: 5px 0 0 0; }
                        .receipt-title { text-align: right; }
                        .receipt-badge { color: #4f46e5; border: 2px solid #4f46e5; padding: 4px 12px; border-radius: 4px; font-weight: 700; text-transform: uppercase; font-size: 14px; display: inline-block; }
                        .receipt-no { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 18px; font-weight: 700; color: #1e293b; margin: 10px 0 0 0; }
                        .date { font-size: 14px; color: #64748b; margin-top: 5px; }
                        .student-details { background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                        .detail-label { font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                        .detail-value { font-size: 15px; font-weight: 600; color: #1e293b; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th { text-align: left; padding: 12px; background: #f1f5f9; color: #475569; font-size: 12px; font-weight: 600; text-transform: uppercase; }
                        td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
                        .amount { text-align: right; font-weight: 500; }
                        .totals-table { width: 100%; margin-top: 10px; }
                        .total-row { background: #f1f5f9; font-weight: 700; font-size: 16px; }
                        .paid-row { background: #f0fdf4; color: #166534; font-weight: 700; }
                        .advance-row { background: #f5f3ff; color: #4338ca; font-size: 13px; font-style: italic; }
                        .footer { margin-top: 60px; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 20px; font-size: 12px; color: #94a3b8; }
                        @media print {
                            body { padding: 0; }
                            .receipt-container { width: 100%; max-width: none; padding: 0; }
                            button { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt-container">
                        <div class="header">
                            <div>
                                <h1 class="school-name">Gen School Mail</h1>
                                <p class="school-info">Excellence in Education</p>
                            </div>
                            <div class="receipt-title">
                                <div class="receipt-badge">Fee Receipt</div>
                                <div class="receipt-no">#${successData.receiptNo}</div>
                                <div class="date">${new Date(successData.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                            </div>
                        </div>

                        <div class="student-details">
                            <div>
                                <div class="detail-label">Student Name</div>
                                <div class="detail-value">${successData.student?.user?.name || 'N/A'}</div>
                            </div>
                            <div>
                                <div class="detail-label">Admission No</div>
                                <div class="detail-value">${successData.student?.admissionNo || 'N/A'}</div>
                            </div>
                            <div>
                                <div class="detail-label">Class</div>
                                <div class="detail-value">${successData.student?.class ? `${successData.student.class.name}-${successData.student.class.section}` : 'N/A'}</div>
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th class="amount">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${successData.items.map((item: any) => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td class="amount">₹${item.amount.toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                                <tr class="total-row">
                                    <td>Grand Total</td>
                                    <td class="amount">₹${successData.totalReceived?.toLocaleString()}</td>
                                </tr>
                                <tr class="paid-row">
                                    <td>Amount Paid (${successData.method})</td>
                                    <td class="amount">₹${successData.totalPaid.toLocaleString()}</td>
                                </tr>
                                ${successData.advanceAmount > 0 ? `
                                <tr class="advance-row">
                                    <td>Added to Advance</td>
                                    <td class="amount">+₹${successData.advanceAmount.toLocaleString()}</td>
                                </tr>
                                ` : ''}
                                <tr class="advance-row">
                                    <td colspan="2" style="text-align: right; padding-top: 10px;">
                                        Current Wallet Balance: ₹${successData.walletBalance.toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <p style="font-size: 13px; color: #64748b; margin-top: 40px;">
                            <strong>Remarks:</strong> Received with thanks. ${successData.reference ? `Ref: ${successData.reference}` : ''}
                        </p>

                        <div class="footer">
                            <p>This is a computer-generated receipt. No signature is required.</p>
                            <p>&copy; ${new Date().getFullYear()} Gen School Mail</p>
                        </div>
                    </div>
                </body>
            </html>
        `;
        const printWindow = window.open('', '', 'width=900,height=800');
        printWindow?.document.write(printContent);
        printWindow?.document.close();
        printWindow?.print();
    };

    const handleClose = () => {
        setSuccessData(null);
        setSelectedFeeIds([]);
        onClose();
        if (successData) onSuccess();
    };

    if (successData) {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-6 w-6" />
                            Payment Successful
                        </DialogTitle>
                        <DialogDescription>
                            All selected fees have been collected.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between"><span>Receipt No:</span> <span className="font-bold">{successData.receiptNo}</span></div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                            <span>Total Received:</span>
                            <span className="font-bold text-lg text-slate-800 dark:text-white">₹{successData.totalReceived?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-indigo-600 font-medium">
                            <span>Allocated to Fees:</span>
                            <span>₹{successData.totalPaid?.toLocaleString()}</span>
                        </div>
                        {successData.advanceAmount > 0 && (
                            <div className="flex justify-between text-green-600 font-medium">
                                <span>Added to Advance:</span>
                                <span>+₹{successData.advanceAmount?.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-slate-500 text-xs pt-1">
                            <span>New Wallet Balance:</span>
                            <span>₹{successData.walletBalance?.toLocaleString()}</span>
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">Close</Button>
                        <Button onClick={handlePrint} className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Printer className="h-4 w-4" /> Print (Quick)
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = `/admin/finance/fees/receipt/${successData.receiptNo}`}
                            className="w-full sm:w-auto gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        >
                            <Download className="h-4 w-4" /> View Full Receipt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Wallet className="w-5 h-5 text-indigo-500" />
                        Collect Fees
                    </DialogTitle>
                    <DialogDescription>
                        Select pending fees for {fee?.student?.user?.name || "Student"}
                    </DialogDescription>
                </DialogHeader>

                {fetching ? (
                    <div className="py-12 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Fee Selection List */}
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="select-all"
                                        checked={selectedFeeIds.length === pendingFees.length && pendingFees.length > 0}
                                        onCheckedChange={(c) => handleSelectAll(!!c)}
                                    />
                                    <Label htmlFor="select-all" className="cursor-pointer font-medium">Select All Pending</Label>
                                </div>
                                <span className="text-sm text-slate-500">{selectedFeeIds.length} selected</span>
                            </div>
                            <div className="max-h-[200px] overflow-y-auto p-2 space-y-1">
                                {pendingFees.length === 0 ? (
                                    <p className="text-center text-slate-500 py-4">No pending fees found.</p>
                                ) : (
                                    pendingFees.map(f => (
                                        <div key={f.id} className={`p-3 rounded-lg border transition-colors ${selectedFeeIds.includes(f.id) ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                            <div className="flex items-center justify-between cursor-pointer" onClick={() => handleToggleFee(f.id)}>
                                                <div className="flex items-center gap-3">
                                                    <Checkbox checked={selectedFeeIds.includes(f.id)} />
                                                    <div>
                                                        <p className="font-medium text-slate-800 dark:text-white">{f.feeStructure.name}</p>
                                                        <p className="text-xs text-slate-500">Due: {new Date(f.dueDate).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-slate-700 dark:text-slate-300">₹{f.pendingAmount.toLocaleString()}</p>
                                                    {f.status === 'PARTIAL' && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Partial</span>}
                                                </div>
                                            </div>

                                            {/* Partial Payment Input - Only show if selected */}
                                            {selectedFeeIds.includes(f.id) && (
                                                <div className="mt-3 pl-7 flex items-center justify-end gap-2 animate-in slide-in-from-top-1 fade-in duration-200">
                                                    <label className="text-xs text-slate-500 font-medium">Paying Now:</label>
                                                    <div className="relative w-32">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={f.pendingAmount}
                                                            value={customAmounts[f.id] !== undefined ? customAmounts[f.id] : f.pendingAmount}
                                                            onChange={(e) => {
                                                                const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                                                                setCustomAmounts(prev => ({
                                                                    ...prev,
                                                                    [f.id]: val as any
                                                                }));
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="w-full pl-6 pr-2 py-1 text-right text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <span className="font-medium text-slate-600 dark:text-slate-400">Total Payable</span>
                                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">₹{totalAmountToPay.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Payment Mode <span className="text-red-500">*</span></Label>
                                <Select value={method} onValueChange={setMethod}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASH">Cash</SelectItem>
                                        <SelectItem value="ONLINE">Online (UPI/Bank)</SelectItem>
                                        <SelectItem value="CHEQUE">Cheque</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Reference No. (Optional)</Label>
                                <Input
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    placeholder="Txn ID / Cheque No"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Remarks (Optional)</Label>
                            <Textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Any additional notes..."
                                className="h-20"
                            />
                        </div>
                    </div>
                )}

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || selectedFeeIds.length === 0}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg w-full sm:w-auto"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" /> Collect ₹{totalAmountToPay.toLocaleString()}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
