import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Book, Calendar, Clock, AlertCircle } from 'lucide-react';

export default async function StudentLibraryPage() {
    const session = await auth();
    if (!session || session.user.role !== 'STUDENT') {
        redirect('/login');
    }

    const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        include: {
            issues: {
                where: { returnDate: null },
                include: { book: true },
                orderBy: { issueDate: 'desc' }
            }
        }
    });

    if (!student) {
        return <div>Student profile not found.</div>;
    }

    const isOverdue = (dueDate: Date) => {
        return new Date() > new Date(dueDate);
    };

    const calculateFine = (dueDate: Date) => {
        if (!isOverdue(dueDate)) return 0;
        const diffTime = Math.abs(new Date().getTime() - new Date(dueDate).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays * 10; // ₹10 per day
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Library Books</h1>
                <p className="text-slate-500">View your currently issued books and due dates</p>
            </div>

            {student.issues.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                    <Book className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">No books currently issued</p>
                    <p className="text-sm text-slate-500 mt-2">Visit the library to borrow books</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {student.issues.map((record: any) => {
                        const overdue = isOverdue(record.dueDate);
                        const fine = calculateFine(record.dueDate);

                        return (
                            <div key={record.id} className={`bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border-2 ${overdue ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
                                }`}>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                                        <Book className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                                            {record.book.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 mb-3">by {record.book.author}</p>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span className="text-slate-600 dark:text-slate-300">
                                                    Issued: {new Date(record.issueDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className={`flex items-center gap-2 text-sm ${overdue ? 'text-red-600' : 'text-slate-600 dark:text-slate-300'}`}>
                                                <Clock className="w-4 h-4" />
                                                <span>
                                                    Due: {new Date(record.dueDate).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {overdue && (
                                                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                                        <AlertCircle className="w-4 h-4" />
                                                        <span className="font-medium text-sm">Overdue</span>
                                                    </div>
                                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                        Fine: ₹{fine}
                                                    </p>
                                                </div>
                                            )}

                                            {!overdue && (
                                                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                    <span className="text-xs text-green-700 dark:text-green-400 font-medium">
                                                        ✓ On time
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
