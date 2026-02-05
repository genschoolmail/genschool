import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                identifier: { label: 'Email or Phone', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            authorize: async (credentials) => {
                // 1. IMPERSONATION FLOW
                const creds = credentials as any;
                if (creds?.impersonationToken) {
                    const { verifyImpersonationToken } = await import('@/lib/auth-utils');
                    const userId = verifyImpersonationToken(creds.impersonationToken as string);

                    if (userId) {
                        const user = await prisma.user.findUnique({ where: { id: userId } });
                        if (user) {
                            return {
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                role: user.role,
                                schoolId: (user as any).schoolId,
                            };
                        }
                    }
                    return null;
                }

                // 2. STANDARD FLOW
                if (!credentials?.identifier || !credentials?.password) {
                    return null;
                }

                const identifier = credentials.identifier as string;

                // Check if identifier is an email or phone
                const isEmail = identifier.includes('@');

                const user = await prisma.user.findFirst({
                    where: isEmail
                        ? { email: identifier }
                        : {
                            OR: [
                                { phone: identifier },
                                { studentProfile: { phone: identifier } },
                                { teacherProfile: { phone: identifier } }
                            ]
                        },
                    include: {
                        school: {
                            select: { subdomain: true, status: true }
                        }
                    }
                });

                if (!user) {
                    return null;
                }

                if (user.school?.status === 'SUSPENDED' && user.role !== 'SUPER_ADMIN') {
                    throw new Error('SchoolSuspended');
                }

                // TENANT VALIDATION
                const requestSubdomain = creds.subdomain as string | null;

                // If user is SUPER_ADMIN, allow login anywhere (or restrict to main domain if preferred)
                if (user.role === 'SUPER_ADMIN') {
                    // Allow
                } else {
                    // For regular users, enforce subdomain match
                    // If requestSubdomain is present (not localhost/null), user MUST belong to that school
                    if (requestSubdomain) {
                        if (user.school?.subdomain !== requestSubdomain) {
                            // User belongs to School A but trying to login to School B
                            // Check if school has custom domain? (Assuming subdomain is the primary key for now)
                            console.log(`Tenant Mismatch: User ${user.email} (School: ${user.school?.subdomain}) tried to login to ${requestSubdomain}`);
                            return null; // Implicitly invalid credentials for this school
                        }
                    } else {
                        // Ideally on localhost (subdomain=null), we might allow any login OR restrict to default-school
                        // For now, on localhost, we allow any login for dev convenience
                    }
                }

                const passwordsMatch = await bcrypt.compare(credentials.password as string, user.password);
                if (!passwordsMatch) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    schoolId: user.schoolId,
                    subdomain: user.school?.subdomain,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.schoolId = (user as any).schoolId;
                token.subdomain = (user as any).subdomain;
            }
            if (trigger === "update" && session) {
                if (session.name) token.name = session.name;
                if (session.email) token.email = session.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
                (session.user as any).schoolId = token.schoolId as string;
                (session.user as any).subdomain = token.subdomain as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                domain: process.env.NODE_ENV === 'production' ? '.platform.com' : undefined,
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },
});
