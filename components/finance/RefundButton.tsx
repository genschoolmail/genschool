'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { refundReceipt } from '@/lib/fee-collection-actions';

export default function RefundButton({ receiptNo }: { receiptNo: string }) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRefund = async () => {
        if (!reason) {
            toast.error("Please provide a reason for the refund");
            return;
        }

        try {
            setLoading(true);
            await refundReceipt(receiptNo, reason);
            toast.success("Receipt refunded successfully");
            setOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to process refund");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Process Refund
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Refund</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to refund this payment? This action will revert the fee status and record a refund expense.
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        placeholder="Reason for refund (required)..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                    <Button variant="destructive" onClick={handleRefund} disabled={loading || !reason}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Confirm Refund
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
