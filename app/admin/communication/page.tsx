import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { createAnnouncement, createPost, deleteAnnouncement, deletePost, createComment } from '@/lib/communication-actions';

export default async function CommunicationPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const announcements = await prisma.announcement.findMany({
        orderBy: { date: 'desc' },
        include: { author: true }
    });

    const posts = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            author: true,
            comments: {
                include: { author: true },
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">School Feed & Communication</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Announcements */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">New Announcement</h2>
                        <form action={async (formData) => {
                            'use server';
                            await createAnnouncement(formData);
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                                <input name="title" required className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                                <textarea name="content" required rows={3} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"></textarea>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">Post Announcement</button>
                        </form>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Recent Announcements</h2>
                        {announcements.map(announcement => (
                            <div key={announcement.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-indigo-600">{announcement.title}</h3>
                                    <form action={async (formData) => {
                                        'use server';
                                        await deleteAnnouncement(formData);
                                    }}>
                                        <input type="hidden" name="id" value={announcement.id} />
                                        <button type="submit" className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                                    </form>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{announcement.content}</p>
                                <div className="text-xs text-slate-500 mt-2 flex justify-between">
                                    <span>{announcement.author.name}</span>
                                    <span>{new Date(announcement.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Feed Posts */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Create Post</h2>
                        <form action={async (formData) => {
                            'use server';
                            await createPost(formData);
                        }} className="space-y-4">
                            <textarea name="content" required placeholder="Share something with the school..." rows={3} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"></textarea>
                            <div className="flex items-center gap-4">
                                <input type="file" name="image" accept="image/*" className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                <button type="submit" className="ml-auto bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">Post</button>
                            </div>
                        </form>
                    </div>

                    <div className="space-y-6">
                        {posts.map(post => (
                            <div key={post.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                            {post.author.name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-white">{post.author.name}</p>
                                            <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <form action={async (formData) => {
                                        'use server';
                                        await deletePost(formData);
                                    }}>
                                        <input type="hidden" name="id" value={post.id} />
                                        <button type="submit" className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                                    </form>
                                </div>

                                <p className="text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-wrap">{post.content}</p>

                                {post.imageUrl && (
                                    <div className="mb-4">
                                        <img src={post.imageUrl} alt="Post image" className="rounded-lg max-h-96 w-full object-cover" />
                                    </div>
                                )}

                                <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                                    <div className="space-y-3 mb-4">
                                        {post.comments.map(comment => (
                                            <div key={comment.id} className="flex gap-2">
                                                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                                    {comment.author.name?.[0] || 'U'}
                                                </div>
                                                <div className="bg-slate-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg text-sm flex-1">
                                                    <span className="font-semibold text-slate-800 dark:text-white mr-2">{comment.author.name}</span>
                                                    <span className="text-slate-600 dark:text-slate-300">{comment.content}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <form action={async (formData) => {
                                        'use server';
                                        await createComment(formData);
                                    }} className="flex gap-2">
                                        <input type="hidden" name="postId" value={post.id} />
                                        <input name="content" required placeholder="Write a comment..." className="flex-1 px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600" />
                                        <button type="submit" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Send</button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
