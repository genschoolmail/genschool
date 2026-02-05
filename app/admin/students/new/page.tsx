import { redirect } from 'next/navigation';
import { getAcademicYears } from '@/lib/actions/academic-year';
import { getClasses } from '@/lib/actions/academics';
import { AddStudentClient } from './AddStudentClient';

export default async function AddStudentPage() {
    const [classes, academicYears] = await Promise.all([
        getClasses(),
        getAcademicYears()
    ]);

    // Mark current academic year
    const currentYear = new Date().getFullYear();
    const formattedYears = academicYears.map(year => {
        const startYear = new Date(year.startDate).getFullYear();
        const endYear = new Date(year.endDate).getFullYear();
        return {
            ...year,
            startYear,
            endYear,
            isCurrent: startYear === currentYear
        };
    });

    // Sort to put current year first
    const sortedYears = formattedYears.sort((a, b) => {
        if (a.isCurrent) return -1;
        if (b.isCurrent) return 1;
        return b.startYear - a.startYear;
    });

    return <AddStudentClient classes={classes} academicYears={sortedYears} />;
}
