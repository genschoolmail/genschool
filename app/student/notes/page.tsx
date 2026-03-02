import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getStudentNotes } from '@/lib/actions/ai-slides';
import { Sparkles, FileText, Download, MessageSquare, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import StudentNoteCard from '@/components/student/StudentNoteCard';

export default async function StudentNotesPage() {
    const session = await auth();
    if (!session || session.user.role !== 'STUDENT') {
        redirect('/login');
    }

    const notes = await getStudentNotes();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-orange-500" />
                            My AI Learning Notes
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Access lessons shared by your teachers and interact with your AI Tutor.
                        </p>
                    </div>
                </div>

                {notes.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-700">
                        <div className="bg-slate-100 dark:bg-slate-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">No notes shared yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">
                            When your teachers share AI-generated slides or notes with your class, they will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {notes.map((note: any) => (
                            <StudentNoteCard key={note.id} note={note} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
