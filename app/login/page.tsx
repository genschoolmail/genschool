import { Suspense } from 'react';
import LoginForm from './LoginForm';
import { getPublicSchool, getSubdomain } from '@/lib/tenant';

export default async function LoginPage() {
    const school = await getPublicSchool();
    const currentSubdomain = getSubdomain();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

            <Suspense fallback={
                <div className="w-full max-w-md h-[500px] bg-white dark:bg-slate-800 rounded-2xl shadow-xl animate-pulse flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            }>
                <LoginForm school={school} currentSubdomain={currentSubdomain} />
            </Suspense>
        </div>
    );
}
