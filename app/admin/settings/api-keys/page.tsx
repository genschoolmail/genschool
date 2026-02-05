import { getApiKeys } from "@/lib/api-keys-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Key, Shield, Zap, Info, Clock, CheckCircle2 } from "lucide-react";
import AddApiKeyDialog from "./AddApiKeyDialog";
import EditApiKeyDialog from "./EditApiKeyDialog";
import DeleteApiKeyButton from "./DeleteApiKeyButton";
import ToggleApiKeyButton from "./ToggleApiKeyButton";
import TestApiKeyButton from "./TestApiKeyButton";
import ScrollToTopButton from "./ScrollToTopButton";

const providerIcons: Record<string, { color: string; gradient: string; icon: string }> = {
    GOOGLE_MAPS: { color: "text-blue-600", gradient: "from-blue-500 to-cyan-500", icon: "🗺️" },
    PAYMENT_GATEWAY: { color: "text-green-600", gradient: "from-green-500 to-emerald-500", icon: "💳" },
    SMS: { color: "text-purple-600", gradient: "from-purple-500 to-pink-500", icon: "📱" },
    EMAIL: { color: "text-orange-600", gradient: "from-orange-500 to-red-500", icon: "✉️" },
    STORAGE: { color: "text-indigo-600", gradient: "from-indigo-500 to-blue-500", icon: "☁️" },
    OTHER: { color: "text-gray-600", gradient: "from-gray-500 to-slate-500", icon: "⚙️" },
};

export default async function ApiKeysPage() {
    const apiKeys = await getApiKeys();

    // Stats
    const activeKeys = apiKeys.filter((k: any) => k.isActive).length;
    const testedKeys = apiKeys.filter((k: any) => k.status === 'ACTIVE').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 -m-8 p-8 relative">
            <ScrollToTopButton />
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                                <Key className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                                    API Keys Management
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400 mt-1">
                                    Securely manage all third-party service credentials
                                </p>
                            </div>
                        </div>
                    </div>
                    <AddApiKeyDialog />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Total Keys</p>
                                    <p className="text-3xl font-bold mt-1">{apiKeys.length}</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-lg">
                                    <Key className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Active Keys</p>
                                    <p className="text-3xl font-bold mt-1">{activeKeys}</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-lg">
                                    <Zap className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Verified Keys</p>
                                    <p className="text-3xl font-bold mt-1">{testedKeys}</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-lg">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* API Keys List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your API Keys</h2>
                        {apiKeys.length > 0 && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {apiKeys.length} {apiKeys.length === 1 ? 'key' : 'keys'} configured
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {apiKeys.map((apiKey: any) => {
                            const provider = providerIcons[apiKey.provider] || providerIcons.OTHER;

                            return (
                                <Card
                                    key={apiKey.id}
                                    className={`border-none shadow-lg hover:shadow-xl transition-all duration-300 ${!apiKey.isActive ? 'opacity-60' : ''}`}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl bg-gradient-to-br ${provider.gradient} shadow-lg`}>
                                                    <span className="text-2xl">{provider.icon}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <CardTitle className="text-xl">{apiKey.name}</CardTitle>
                                                        <Badge variant={apiKey.isActive ? "default" : "secondary"} className="ml-2">
                                                            {apiKey.isActive ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </div>
                                                    <CardDescription>{apiKey.description || "No description provided"}</CardDescription>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    {apiKey.provider}
                                                </Badge>
                                                {apiKey.status && (
                                                    <Badge
                                                        variant={
                                                            apiKey.status === 'ACTIVE' ? 'default' :
                                                                apiKey.status === 'FAILED' ? 'destructive' :
                                                                    'secondary'
                                                        }
                                                        className="gap-1"
                                                    >
                                                        {apiKey.status === 'ACTIVE' && <CheckCircle2 className="h-3 w-3" />}
                                                        {apiKey.status}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* API Key Display */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">API Key</p>
                                                <p className="font-mono text-sm text-slate-900 dark:text-white">
                                                    {apiKey.key}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <TestApiKeyButton id={apiKey.id} status={apiKey.status} />
                                                <ToggleApiKeyButton id={apiKey.id} isActive={apiKey.isActive} />
                                                <EditApiKeyDialog apiKey={apiKey} />
                                                <DeleteApiKeyButton id={apiKey.id} name={apiKey.name} />
                                            </div>
                                        </div>

                                        {/* Metadata */}
                                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {apiKey.lastTested && (
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    <span>Last tested: {new Date(apiKey.lastTested).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {/* Empty State */}
                        {apiKeys.length === 0 && (
                            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <CardContent className="pt-12 pb-12 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <Key className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                        No API Keys Yet
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                                        Start by adding your first API key to integrate third-party services with your school management system
                                    </p>
                                    <AddApiKeyDialog />
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Provider Guide */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-lg">Supported API Providers</CardTitle>
                        </div>
                        <CardDescription>
                            Commonly integrated third-party services for enhanced functionality
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(providerIcons).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                                >
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${value.gradient} flex items-center justify-center text-lg shadow-sm`}>
                                        {value.icon}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-slate-900 dark:text-white">{key}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {key === 'GOOGLE_MAPS' && 'Maps & Location'}
                                            {key === 'PAYMENT_GATEWAY' && 'Payments & Billing'}
                                            {key === 'SMS' && 'SMS Notifications'}
                                            {key === 'EMAIL' && 'Email Services'}
                                            {key === 'STORAGE' && 'Cloud Storage'}
                                            {key === 'OTHER' && 'Custom Services'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Security Notice */}
                <Card className="border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-900/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                                    Security Information
                                </h4>
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    All API keys are encrypted using AES-256 encryption before storage.
                                    Only the last 4 characters are displayed for security.
                                    Test your keys regularly to ensure they remain valid.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
