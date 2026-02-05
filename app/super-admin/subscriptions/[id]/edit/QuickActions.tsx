"use client";

import React from 'react';

export default function QuickActions() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
                type="button"
                onClick={(e) => {
                    const form = e.currentTarget.closest('form');
                    const endDateInput = form?.querySelector('[name="endDate"]') as HTMLInputElement;
                    if (endDateInput) {
                        const date = new Date();
                        date.setMonth(date.getMonth() + 1);
                        endDateInput.value = date.toISOString().split('T')[0];
                    }
                }}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
                Extend +1 Month
            </button>
            <button
                type="button"
                onClick={(e) => {
                    const form = e.currentTarget.closest('form');
                    const endDateInput = form?.querySelector('[name="endDate"]') as HTMLInputElement;
                    if (endDateInput) {
                        const date = new Date();
                        date.setFullYear(date.getFullYear() + 1);
                        endDateInput.value = date.toISOString().split('T')[0];
                    }
                }}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
            >
                Extend +1 Year
            </button>
            <button
                type="button"
                onClick={(e) => {
                    const form = e.currentTarget.closest('form');
                    const priceInput = form?.querySelector('[name="priceOverride"]') as HTMLInputElement;
                    if (priceInput) {
                        priceInput.value = '';
                    }
                }}
                className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm font-medium"
            >
                Reset Custom Price
            </button>
        </div>
    );
}
