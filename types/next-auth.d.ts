import NextAuth, { DefaultSession } from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            role: string;
            id: string;
            schoolId?: string | null;
            subdomain?: string | null;
        } & DefaultSession["user"];
    }

    interface User {
        role: string;
        schoolId?: string | null;
        subdomain?: string | null;
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        role: string;
        id: string;
        schoolId?: string | null;
        subdomain?: string | null;
    }
}
