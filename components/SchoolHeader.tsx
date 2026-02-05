import React from 'react';

interface SchoolHeaderProps {
    schoolName?: string | null;
    logoUrl?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    contactNumber?: string | null;
    email?: string | null;
    affiliationNumber?: string | null;
    affiliatedTo?: string | null;
    showLogo?: boolean;
    showAddress?: boolean;
    showContact?: boolean;
    showAffiliation?: boolean;
    className?: string;
}

export default function SchoolHeader({
    schoolName,
    logoUrl,
    address,
    city,
    state,
    pincode,
    contactNumber,
    email,
    affiliationNumber,
    affiliatedTo,
    showLogo = true,
    showAddress = true,
    showContact = true,
    showAffiliation = false,
    className = ''
}: SchoolHeaderProps) {
    const fullAddress = [address, city, state, pincode].filter(Boolean).join(', ');

    return (
        <div className={`text-center border-b-2 border-slate-800 pb-4 mb-6 ${className}`}>
            <div className="flex items-center justify-center gap-4 mb-2">
                {showLogo && logoUrl && (
                    <img
                        src={logoUrl}
                        alt="School Logo"
                        className="w-16 h-16 object-contain"
                    />
                )}
                <div className={!logoUrl ? 'text-center' : 'text-left'}>
                    <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-wider">
                        {schoolName || 'SCHOOL NAME'}
                    </h1>
                    {showAddress && fullAddress && (
                        <p className="text-xs text-slate-500 mt-1">{fullAddress}</p>
                    )}
                    {showContact && (contactNumber || email) && (
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                            {contactNumber && `Ph: ${contactNumber}`}
                            {contactNumber && email && ' | '}
                            {email && `Email: ${email}`}
                        </p>
                    )}
                    {showAffiliation && affiliationNumber && (
                        <p className="text-xs text-slate-600 mt-0.5">
                            Affiliation No: {affiliationNumber}
                            {affiliatedTo && ` (${affiliatedTo})`}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
