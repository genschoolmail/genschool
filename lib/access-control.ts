import { auth } from '@/auth';

export interface AccessScope {
    canAccessAll: boolean;
    schoolId?: string;
    role: string;
}

/**
 * Get access scope based on user role
 * - SUPER_ADMIN: Can access all schools
 * - Others: Restricted to their schoolId
 */
export async function getAccessScope(): Promise<AccessScope> {
    const session = await auth();

    if (!session?.user) {
        throw new Error('Unauthorized: No session found');
    }

    const role = session.user.role;

    // Super Admin has platform-wide access
    if (role === 'SUPER_ADMIN') {
        return {
            canAccessAll: true,
            role
        };
    }

    // All other roles are restricted to their school
    return {
        canAccessAll: false,
        schoolId: (session.user as any).schoolId,
        role
    };
}

/**
 * Get the schoolId to use for queries
 * @param requestedSchoolId - Optional schoolId for Super Admin to override
 */
export async function getAccessibleSchoolId(requestedSchoolId?: string): Promise<string> {
    const scope = await getAccessScope();

    // Super Admin can access any school
    if (scope.canAccessAll && requestedSchoolId) {
        return requestedSchoolId;
    }

    // Non-super-admin users must use their own schoolId
    if (!scope.schoolId) {
        throw new Error('User has no school association');
    }

    return scope.schoolId;
}

/**
 * Ensure user is Super Admin
 */
export async function ensureSuperAdmin() {
    const scope = await getAccessScope();
    if (!scope.canAccessAll) {
        throw new Error('Unauthorized: Super Admin access required');
    }
}

/**
 * Check if user can access a specific school's data
 */
export async function canAccessSchool(schoolId: string): Promise<boolean> {
    const scope = await getAccessScope();

    if (scope.canAccessAll) return true;
    return scope.schoolId === schoolId;
}
