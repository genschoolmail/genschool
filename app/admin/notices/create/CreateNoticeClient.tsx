'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createAnnouncement } from '@/lib/actions/announcement-actions';
import {
    Send,
    Image as ImageIcon,
    FileText,
    Users,
    Globe,
    ArrowLeft,
    X,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface CreateNoticeClientProps {
    classes: { id: string; name: string; section: string }[];
    students: { id: string; user: { name: string } }[];
}

export default function CreateNoticeClient({ classes, students }: CreateNoticeClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [targetRole, setTargetRole] = useState('ALL');
    const [classId, setClassId] = useState('');
    const [recipientId, setRecipientId] = useState('');

    // Attachment State
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [attachmentType, setAttachmentType] = useState<'IMAGE' | 'PDF' | null>(null);
    const [fileName, setFileName] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const type = file.type.startsWith('image/') ? 'IMAGE' : file.type === 'application/pdf' ? 'PDF' : null;
        setAttachmentType(type);

        const reader = new FileReader();
        reader.onloadend = () => {
            setAttachmentUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createAnnouncement({
                title,
                content,
                isPublic,
                targetRole: isPublic ? 'ALL' : targetRole,
                classId: (!isPublic && targetRole === 'STUDENT') ? classId : undefined,
                recipientId: (!isPublic && recipientId) ? recipientId : undefined,
                attachmentUrl,
                attachmentType: attachmentType || undefined
            });

            if (result.success) {
                toast.success('Notice published successfully');
                router.push('/admin/notices');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to publish notice');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/notices"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Create New Notice</h1>
                        <p className="text-slate-500 text-sm">Design and target your announcement.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
                {/* Left Side: Content */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Notice Title / Subject
                            </label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="Enter a clear title..."
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Detailed Content
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                rows={10}
                                placeholder="Provide all the details here..."
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white resize-none"
                            />
                        </div>

                        {/* Attachment Preview */}
                        {attachmentUrl && (
                            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAttachmentUrl('');
                                        setAttachmentType(null);
                                        setFileName('');
                                    }}
                                    className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                {attachmentType === 'IMAGE' ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <img src={attachmentUrl} alt="Preview" className="max-h-48 rounded-lg" />
                                        <span className="text-xs text-slate-500">{fileName}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{fileName}</p>
                                            <p className="text-xs text-slate-500">PDF Document Attached</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Options & Targeting */}
                <div className="space-y-6">
                    {/* Notice Mode */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                            Notice Visibility
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setIsPublic(false)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${!isPublic
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                                    : 'border-slate-100 dark:border-slate-700 hover:border-slate-200'}`}
                            >
                                <Users className="w-5 h-5" />
                                <span className="text-xs font-bold">Portal</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsPublic(true)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${isPublic
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                                    : 'border-slate-100 dark:border-slate-700 hover:border-slate-200'}`}
                            >
                                <Globe className="w-5 h-5" />
                                <span className="text-xs font-bold">Homepage</span>
                            </button>
                        </div>
                    </div>

                    {!isPublic && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 animate-in fade-in slide-in-from-right-4">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                Target Audience
                            </label>
                            <select
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 outline-none"
                            >
                                <option value="ALL">All Users</option>
                                <option value="STUDENT">Students</option>
                                <option value="TEACHER">Teachers</option>
                                <option value="DRIVER">Drivers</option>
                            </select>

                            {targetRole === 'STUDENT' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Specific Class (Optional)</label>
                                        <select
                                            value={classId}
                                            onChange={(e) => setClassId(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 outline-none"
                                        >
                                            <option value="">All Classes</option>
                                            {classes.map(c => (
                                                <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Individual Student (Optional)</label>
                                        <select
                                            value={recipientId}
                                            onChange={(e) => setRecipientId(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 outline-none"
                                        >
                                            <option value="">None</option>
                                            {students.map(s => (
                                                <option key={s.id} value={s.id}>{s.user.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Media Upload */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                            Add Image or PDF
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="notice-file"
                            />
                            <label
                                htmlFor="notice-file"
                                className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                            >
                                <div className="flex -space-x-2">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-slate-500">Click to upload media</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:translate-y-0"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                <span>Publish Information</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
