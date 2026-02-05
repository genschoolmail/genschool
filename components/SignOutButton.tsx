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

            // Determine the base domain (localhost or production platform)
            const isLocalhost = window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1';
            const protocol = window.location.protocol;
            const baseDomain = isLocalhost ? 'localhost:3000' : 'platform.com'; // Adjust 'platform.com' to your actual production root domain if different

            if (userRole === 'SUPER_ADMIN') {
                // Super Admin -> Root Domain
                callbackUrl = `${protocol}//${baseDomain}`;
            } else if (subdomain) {
                // School Users (with known subdomain) -> School Subdomain Landing Page
                callbackUrl = `${protocol}//${subdomain}.${baseDomain}`;
                if (isLocalhost) {
                    // Handle localhost specific case to avoid double subdomain if baseDomain is localhost:3000
                    // If baseDomain is 'localhost:3000', then subdomain.localhost:3000 is correct.
                }
            } else {
                // Fallback: If we are already on a subdomain (e.g. success.localhost), stay there!
                // Don't default to origin if origin is root, but if origin is subdomain, keep it.
                callbackUrl = window.location.origin;
            }

            // Perform signout with redirect: false so we can manually handle the navigation
            await signOut({ redirect: false });

            // Force full page navigation to the callback URL
            window.location.href = callbackUrl;

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
