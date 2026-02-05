import { generateYearEndReport } from "@/lib/promotion-system-actions";
import { getAcademicYears } from "@/lib/actions";
import YearEndReportClient from "./YearEndReportClient";

export default async function YearEndReportPage() {
    const academicYears = await getAcademicYears();

    return <YearEndReportClient academicYears={academicYears} />;
}
