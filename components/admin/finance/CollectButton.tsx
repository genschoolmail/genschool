"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import PaymentCollectionModal from "./PaymentCollectionModal";
import { useRouter } from "next/navigation";

export default function CollectButton({ fee, currentUser }: { fee: any; currentUser: any }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleSuccess = () => {
        router.refresh();
        // Keep modal open or close? Modal handles its own success state view (Receipt).
        // If modal closes itself, this is fine.
    };

    return (
        <>
            <Button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
                Collect
            </Button>

            <PaymentCollectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                fee={fee}
                currentUser={currentUser}
                onSuccess={handleSuccess}
            />
        </>
    );
}
