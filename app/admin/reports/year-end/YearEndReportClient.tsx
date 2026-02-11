"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    FileText, Download, Users, IndianRupee, GraduationCap,
    Calendar, CheckCircle, Loader2, PieChart, TrendingUp, Trophy
} from "lucide-react";
import { toast } from "sonner";
import { generateYearEndReport } from "@/lib/promotion-system-actions";

interface AcademicYear {
    startYear: number;
    endYear: number;
}

export default function YearEndReportClient({ academicYears }: { academicYears: AcademicYear[] }) {
    const [selectedYear, setSelectedYear] = useState('');
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<any>(null);

    const handleGenerate = async () => {
        if (!selectedYear) {
            toast.error("Select academic year first");
            return;
        }
        setLoading(true);
        try {
            const data = await generateYearEndReport(selectedYear);
            setReport(data);
            toast.success("Report generated successfully!");
        } catch (error) {
            toast.error("Failed to generate report");
        }
        setLoading(false);
    };

    const handleDownload = () => {
        if (!report) return;

        // Generate HTML report
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Year-End Report - ${report.academicYear}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 1000px; margin: 0 auto; }
        h1 { color: #4F46E5; text-align: center; }
        h2 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
        .stat-card { background: #f8fafc; border-radius: 10px; padding: 15px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #4F46E5; }
        .stat-label { font-size: 12px; color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
        th { background: #4F46E5; color: white; }
        tr:nth-child(even) { background: #f8fafc; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <h1>📊 Year-End Comprehensive Report</h1>
    <p style="text-align: center; color: #64748b;">Academic Year: ${report.academicYear} | Generated: ${new Date(report.generatedAt).toLocaleString('en-IN')}</p>
    
    <h2>👥 Student Summary</h2>
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">${report.studentSummary.totalStudents}</div>
            <div class="stat-label">Total Students</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${report.studentSummary.byGender.male}</div>
            <div class="stat-label">Male</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${report.studentSummary.byGender.female}</div>
            <div class="stat-label">Female</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${report.studentSummary.byGender.other}</div>
            <div class="stat-label">Other</div>
        </div>
    </div>
    
    <h3>Class-wise Distribution</h3>
    <table>
        <tr><th>Class</th><th>Students</th></tr>
        ${report.studentSummary.byClass.map((c: any) => `<tr><td>${c.class}</td><td>${c.count}</td></tr>`).join('')}
    </table>
    
    <h2>📅 Attendance Summary</h2>
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">${report.attendanceSummary.totalRecords}</div>
            <div class="stat-label">Total Records</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${report.attendanceSummary.presentCount}</div>
            <div class="stat-label">Present</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${report.attendanceSummary.attendancePercentage}%</div>
            <div class="stat-label">Attendance Rate</div>
        </div>
    </div>
    
    <h2>💰 Finance Summary</h2>
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">₹${report.financeSummary.totalFeeCollected.toLocaleString()}</div>
            <div class="stat-label">Fee Collected</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${report.financeSummary.totalPayments}</div>
            <div class="stat-label">Payments</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">₹${report.financeSummary.totalExpenses.toLocaleString()}</div>
            <div class="stat-label">Expenses</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">₹${report.financeSummary.netIncome.toLocaleString()}</div>
            <div class="stat-label">Net Income</div>
        </div>
    </div>
    
    <h2>📝 Exam Summary</h2>
    <table>
        <tr><th>Exam Group</th><th>Schedules</th><th>Results</th></tr>
        ${report.examSummary.examGroups.map((eg: any) => `<tr><td>${eg.name}</td><td>${eg.scheduleCount}</td><td>${eg.resultCount}</td></tr>`).join('')}
    </table>
    
    <h2>🏆 Top Performers</h2>
    <table>
        <tr><th>Rank</th><th>Name</th><th>Class</th><th>Percentage</th></tr>
        ${report.topPerformers.map((p: any, i: number) => `<tr><td>${i + 1}</td><td>${p.name}</td><td>${p.class}</td><td>${p.percentage}%</td></tr>`).join('')}
    </table>
    
    <div class="footer">
        <p>Generated by Gen School Mail</p>
    </div>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Year_End_Report_${selectedYear}.html`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Report downloaded!");
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <FileText className="h-8 w-8 text-indigo-600" />
                        Year-End Comprehensive Report
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Generate complete annual report with all module data
                    </p>
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium mb-2">Academic Year</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 min-w-[200px]"
                            >
                                <option value="">Select Year</option>
                                {academicYears.map(y => (
                                    <option key={`${y.startYear}-${y.endYear}`} value={`${y.startYear}-${y.endYear}`}>
                                        {y.startYear}-{y.endYear}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button onClick={handleGenerate} disabled={loading || !selectedYear} className="bg-indigo-600 hover:bg-indigo-700">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                            Generate Report
                        </Button>
                        {report && (
                            <Button onClick={handleDownload} variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                Download HTML
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {report && (
                <div className="space-y-6">
                    {/* Student Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                Student Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center">
                                    <p className="text-3xl font-bold text-blue-600">{report.studentSummary.totalStudents}</p>
                                    <p className="text-sm text-muted-foreground">Total Students</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-center">
                                    <p className="text-3xl font-bold text-indigo-600">{report.studentSummary.byGender.male}</p>
                                    <p className="text-sm text-muted-foreground">Male</p>
                                </div>
                                <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-xl text-center">
                                    <p className="text-3xl font-bold text-pink-600">{report.studentSummary.byGender.female}</p>
                                    <p className="text-sm text-muted-foreground">Female</p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center">
                                    <p className="text-3xl font-bold text-purple-600">{report.studentSummary.byGender.other}</p>
                                    <p className="text-sm text-muted-foreground">Other</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Finance Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IndianRupee className="h-5 w-5 text-green-600" />
                                Finance Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center">
                                    <p className="text-2xl font-bold text-green-600">₹{report.financeSummary.totalFeeCollected.toLocaleString()}</p>
                                    <p className="text-sm text-muted-foreground">Fee Collected</p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center">
                                    <p className="text-2xl font-bold text-blue-600">{report.financeSummary.totalPayments}</p>
                                    <p className="text-sm text-muted-foreground">Payments</p>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-center">
                                    <p className="text-2xl font-bold text-red-600">₹{report.financeSummary.totalExpenses.toLocaleString()}</p>
                                    <p className="text-sm text-muted-foreground">Expenses</p>
                                </div>
                                <div className={`p-4 rounded-xl text-center ${report.financeSummary.netIncome >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                    <p className={`text-2xl font-bold ${report.financeSummary.netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        ₹{report.financeSummary.netIncome.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Net Income</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attendance Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-amber-600" />
                                Attendance Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl text-center">
                                    <p className="text-3xl font-bold text-amber-600">{report.attendanceSummary.totalRecords}</p>
                                    <p className="text-sm text-muted-foreground">Total Records</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center">
                                    <p className="text-3xl font-bold text-green-600">{report.attendanceSummary.presentCount}</p>
                                    <p className="text-sm text-muted-foreground">Present</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-center">
                                    <p className="text-3xl font-bold text-indigo-600">{report.attendanceSummary.attendancePercentage}%</p>
                                    <p className="text-sm text-muted-foreground">Attendance Rate</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Performers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-600" />
                                Top Performers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-700">
                                        <tr>
                                            <th className="p-3 text-left">Rank</th>
                                            <th className="p-3 text-left">Name</th>
                                            <th className="p-3 text-left">Class</th>
                                            <th className="p-3 text-center">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.topPerformers.map((performer: any, idx: number) => (
                                            <tr key={idx} className="border-b">
                                                <td className="p-3">
                                                    {idx < 3 ? (
                                                        <span className="flex items-center gap-1">
                                                            <Trophy className={`h-4 w-4 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : 'text-amber-600'}`} />
                                                            {idx + 1}
                                                        </span>
                                                    ) : idx + 1}
                                                </td>
                                                <td className="p-3 font-medium">{performer.name}</td>
                                                <td className="p-3">{performer.class}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`font-bold ${performer.percentage >= 75 ? 'text-green-600' : performer.percentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                                        {performer.percentage}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
