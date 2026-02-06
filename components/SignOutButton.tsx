'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

interface SignOutButtonProps {
    className?: string;
    collapsed?: boolean;
    userRole?: string;
    subdomain?: string | null;
}

export default function SignOutButton({ className, collapsed, userRole, subdomain }: SignOutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            let callbackUrl = '/';

            // Determine the base domain dynamically from current location
            const protocol = window.location.protocol;
            const host = window.location.host; // e.g. success.localhost:3000 or school.genschoolmail.in
            const hostname = window.location.hostname;

            // Clean host of 'www.' for base domain calculation
            const cleanHost = host.replace(/^www\./, '');

            // If we are on a subdomain (parts > 2 or parts > 1 for localhost), extract the base domain
            const parts = hostname.split('.');
            let baseDomain = '';

            if (hostname.includes('localhost')) {
                // school.localhost:3000 -> localhost:3000
                baseDomain = parts.length > 1 ? `localhost:${window.location.port}` : host;
            } else {
                // school.genschoolmail.in -> genschoolmail.in
                baseDomain = parts.length > 2 ? parts.slice(1).join('.') : cleanHost;
            }

            if (userRole === 'SUPER_ADMIN') {
                // Super Admin -> Root Domain
                callbackUrl = `${protocol}//${baseDomain}`;
            } else if (subdomain) {
                // School Users -> School Subdomain Landing Page
                callbackUrl = `${protocol}//${subdomain}.${baseDomain}`;
            } else {
                // Fallback: stay on current origin
                callbackUrl = window.location.origin;
            }

            console.log(`[SignOut] Redirecting to: ${callbackUrl}`);

            // Perform signout with redirect: false so we can manually handle the navigation
            await signOut({ redirect: false });

            // Force full page navigation to the callback URL
            window.location.assign(callbackUrl);

        } catch (error) {
            console.error("Signout error:", error);
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleSignOut}
            disabled={isLoading}
            className={className || "flex items-center w-full px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200 group touch-target"}
        >
            <LogOut className={`w-5 h-5 ${collapsed ? '' : 'mr-3'} group-hover:scale-110 transition-transform ${isLoading ? 'animate-pulse' : ''}`} />
            {!collapsed && <span className="font-medium">{isLoading ? 'Signing out...' : 'Sign Out'}</span>}
        </button>
    );
}
