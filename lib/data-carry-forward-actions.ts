'use server';

export async function previewDataCarryForward(fromYearId: string, toYearId: string) {
    if (!fromYearId || !toYearId) throw new Error("Year IDs required");
    // Stub implementation
    return {
        success: true,
        preview: {
            totalSubjects: 0,
            totalTimetableEntries: 0,
            subjects: []
        }
    };
}

export async function executeDataCarryForward(subjectIds: string[], copyTimetable: boolean, toYearId: string) {
    if (!toYearId) throw new Error("toYearId required");
    return {
        success: true,
        message: "Data carry forward logic not implemented yet."
    };
}
