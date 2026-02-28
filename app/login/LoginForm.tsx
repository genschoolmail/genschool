'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { validateCredentials } from '@/lib/actions/auth';

interface LoginFormProps {
    school: any;
    currentSubdomain: string | null;
}

export default function LoginForm({ school, currentSubdomain }: LoginFormProps) {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam === 'TenantMismatch') {
            setError('This account does not belong to this school portal.');
        } else if (errorParam === 'InvalidUser') {
            setError('User not found. Please check your email or phone number.');
        } else if (errorParam === 'InvalidPassword') {
            setError('Incorrect password. Please try again.');
        } else if (errorParam === 'CredentialsSignin') {
            // Check if there is a more detailed reason passed (sometimes possible in custom setups)
            setError('Invalid email/phone or password');
        } else if (errorParam === 'SchoolSuspended') {
            setError('This school portal has been suspended.');
        } else if (errorParam) {
            setError('An error occurred during sign-in.');
        }
    }, [searchParams]);

    const [secretCount, setSecretCount] = useState(0);

    const handleLogoClick = () => {
        const newCount = secretCount + 1;
        setSecretCount(newCount);
        if (newCount === 10) {
            router.push('/login/reset-admin');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Pre-validation to distinguish between User not found and Incorrect password
            const validationResult = await validateCredentials(identifier, password, currentSubdomain);

            if (validationResult.error) {
                if (validationResult.error === 'InvalidUser') {
                    setError('User not found. Please check your email or phone number.');
                } else if (validationResult.error === 'InvalidPassword') {
                    setError('Incorrect password. Please try again.');
                } else if (validationResult.error === 'TenantMismatch') {
                    setError('This account does not belong to this school portal.');
                } else {
                    setError('An error occurred. Please try again.');
                }
                setLoading(false);
                return;
            }

            // Now call the official signIn for session management
            const result = await signIn('credentials', {
                identifier,
                password,
                subdomain: currentSubdomain,
                redirect: false,
            });

            if (result?.error) {
                // NextAuth typically returns 'CredentialsSignin' for any authorize throw
                // But we can check if it passed a specific message (though standard next-auth masks this)
                // For now, we will handle the generic error by informing the user to check both.
                // However, I will enhance the LoginForm to show specific errors based on the URL params
                // which NextAuth uses to pass back error codes.
                if (result.error === 'CredentialsSignin') {
                    setError('Invalid email/phone or password');
                } else {
                    setError(result.error);
                }
                setLoading(false);
            } else {
                const session = await getSession();
                const role = (session?.user as any)?.role;

                const roleRedirects: Record<string, string> = {
                    'SUPER_ADMIN': '/super-admin',
                    'ADMIN': '/admin',
                    'TEACHER': '/teacher',
                    'STUDENT': '/student',
                    'DRIVER': '/driver',
                    'ACCOUNTANT': '/admin/finance'
                };

                router.push(roleRedirects[role] || '/');
                router.refresh();
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
            <div className="p-8">
                <div className="text-center mb-8">
                    <div
                        onClick={handleLogoClick}
                        className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-4 cursor-pointer active:scale-95 transition-transform select-none overflow-hidden"
                    >
                        {school?.logo ? (
                            <img src={school.logo} alt={school.name} className="w-full h-full object-contain p-2" />
                        ) : !currentSubdomain ? (
                            <img src="/images/gsm-logo.png" alt="Gen School Mail" className="w-full h-full object-contain p-2 brightness-0 invert" />
                        ) : (
                            <span className="text-white font-bold text-2xl">
                                {school?.name ? school.name.charAt(0).toUpperCase() : 'S'}
                            </span>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {school?.name || 'Gen School Mail'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
                        {school ? `Sign in to ${school.name} Portal` : 'Platform Administration Login'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email or Phone</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="Email or Phone Number"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="flex justify-end mt-2">
                            <Link
                                href="/login/forgot-password"
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 text-center border-t border-slate-100 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    SECURE PORTAL ACCESS
                </p>
            </div>
        </div>
    );
}
