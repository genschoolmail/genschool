'use client';

import { useState, useEffect } from 'react';
import { createStudent } from '@/lib/actions';
import { generateAdmissionNo, getAutoAssignment, getUniqueClassNames, getSectionsForClass } from '@/lib/actions/admission-actions';
import { User, Mail, Phone, MapPin, Calendar, Users, Upload, Save, X, Loader2, CheckCircle } from 'lucide-react';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import Link from 'next/link';
import { toast } from 'sonner';

interface Class {
    id: string;
    name: string;
    section: string;
}

interface AcademicYear {
    startYear: number;
    endYear: number;
    isCurrent?: boolean;
}

interface SectionInfo {
    id: string;
    section: string;
    capacity: number;
    enrolled: number;
    available: number;
}

export function AddStudentClient({
    classes,
    academicYears
}: {
    classes: Class[];
    academicYears: AcademicYear[];
}) {
    const [loading, setLoading] = useState(false);
    const [admissionNo, setAdmissionNo] = useState('');
    const [loadingAdmission, setLoadingAdmission] = useState(true);

    // Class/Section/Roll auto-assignment
    const [selectedClassName, setSelectedClassName] = useState('');
    const [sections, setSections] = useState<SectionInfo[]>([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [autoSection, setAutoSection] = useState('');
    const [autoRollNo, setAutoRollNo] = useState('');
    const [loadingSection, setLoadingSection] = useState(false);

    // Get unique class names
    const uniqueClassNames = [...new Set(classes.map(c => c.name))].sort((a, b) => {
        const numA = parseInt(a) || 0;
        const numB = parseInt(b) || 0;
        return numA - numB;
    });

    // Generate admission number on mount
    useEffect(() => {
        async function fetchAdmissionNo() {
            try {
                const newAdmissionNo = await generateAdmissionNo();
                setAdmissionNo(newAdmissionNo);
            } catch (error) {
                console.error('Error generating admission number:', error);
                toast.error('Failed to generate admission number');
            } finally {
                setLoadingAdmission(false);
            }
        }
        fetchAdmissionNo();
    }, []);

    // Fetch sections when class name changes
    useEffect(() => {
        async function fetchSections() {
            if (!selectedClassName) {
                setSections([]);
                setSelectedClassId('');
                setAutoSection('');
                setAutoRollNo('');
                return;
            }

            setLoadingSection(true);
            try {
                const sectionData = await getSectionsForClass(selectedClassName);
                setSections(sectionData);

                // Auto-select first section with availability
                const availableSection = sectionData.find((s: SectionInfo) => s.available > 0);
                if (availableSection) {
                    setSelectedClassId(availableSection.id);
                    setAutoSection(availableSection.section);
                    // Get roll number for this section
                    const result = await getAutoAssignment(selectedClassName);
                    if (result.success && result.rollNo) {
                        setAutoRollNo(result.rollNo);
                    }
                } else {
                    toast.error('All sections are full for this class');
                    setSelectedClassId('');
                    setAutoSection('');
                    setAutoRollNo('');
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
            } finally {
                setLoadingSection(false);
            }
        }
        fetchSections();
    }, [selectedClassName]);

    // Handle section change
    const handleSectionChange = async (classId: string) => {
        setSelectedClassId(classId);
        const section = sections.find(s => s.id === classId);
        if (section) {
            setAutoSection(section.section);
            // Recalculate roll number for this section
            const result = await getAutoAssignment(selectedClassName);
            if (result.success && result.rollNo) {
                setAutoRollNo(result.rollNo);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        // Override with auto-generated values
        formData.set('admissionNo', admissionNo);
        formData.set('classId', selectedClassId);
        formData.set('rollNo', autoRollNo);

        try {
            const result = await createStudent(formData);
            if (result.success) {
                toast.success('Student created successfully!');
                window.location.href = '/admin/students';
            } else {
                toast.error(result.error || 'Failed to create student');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error creating student:', error);
            toast.error('Failed to create student');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Add New Student</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Enter student details to create a new record</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Auto-Generated Info Banner */}
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-green-800 dark:text-green-200">Auto-Generated Details</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs text-green-600 font-medium">Admission No</p>
                                {loadingAdmission ? (
                                    <div className="flex items-center gap-2 text-green-700">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Generating...</span>
                                    </div>
                                ) : (
                                    <p className="text-lg font-bold text-green-800 dark:text-green-200 font-mono">{admissionNo}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-green-600 font-medium">Section</p>
                                {loadingSection ? (
                                    <div className="flex items-center gap-2 text-green-700">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                ) : autoSection ? (
                                    <p className="text-lg font-bold text-green-800 dark:text-green-200">Section {autoSection}</p>
                                ) : (
                                    <p className="text-sm text-green-600">Select class first</p>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-green-600 font-medium">Roll No</p>
                                {loadingSection ? (
                                    <div className="flex items-center gap-2 text-green-700">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                ) : autoRollNo ? (
                                    <p className="text-lg font-bold text-green-800 dark:text-green-200">{autoRollNo}</p>
                                ) : (
                                    <p className="text-sm text-green-600">Select class first</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-500" />
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Full Name *"
                                name="name"
                                required
                                placeholder="e.g. John Doe"
                                icon={<User className="w-4 h-4" />}
                            />

                            <FormInput
                                label="Email *"
                                type="email"
                                name="email"
                                required
                                placeholder="student@school.com"
                                icon={<Mail className="w-4 h-4" />}
                            />

                            <FormInput
                                label="Phone"
                                type="tel"
                                name="phone"
                                placeholder="+91 98765 43210"
                                icon={<Phone className="w-4 h-4" />}
                            />

                            <FormInput
                                label="Date of Birth"
                                type="date"
                                name="dob"
                                icon={<Calendar className="w-4 h-4" />}
                            />
                        </div>
                    </section>

                    <div className="h-px bg-slate-200 dark:bg-slate-700" />

                    {/* Academic Information */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" />
                            Academic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Class *
                                </label>
                                <select
                                    value={selectedClassName}
                                    onChange={(e) => setSelectedClassName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                >
                                    <option value="">Select Class</option>
                                    {uniqueClassNames.map((name) => (
                                        <option key={name} value={name}>
                                            Class {name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Section *
                                </label>
                                <select
                                    value={selectedClassId}
                                    onChange={(e) => handleSectionChange(e.target.value)}
                                    required
                                    disabled={!selectedClassName || sections.length === 0}
                                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
                                >
                                    <option value="">
                                        {loadingSection ? 'Loading...' : 'Select Section'}
                                    </option>
                                    {sections.map((sec) => (
                                        <option key={sec.id} value={sec.id} disabled={sec.available === 0}>
                                            Section {sec.section} ({sec.available} seats left)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <FormInput
                                label="Roll No *"
                                name="rollNo"
                                required
                                value={autoRollNo}
                                onChange={(e) => setAutoRollNo(e.target.value)}
                                placeholder="e.g. 101"
                                icon={<Users className="w-4 h-4" />}
                            />

                            <FormSelect
                                label="Gender *"
                                name="gender"
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </FormSelect>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormSelect
                                label="Admission Year"
                                name="admissionYear"
                            >
                                <option value="">Select Year</option>
                                {academicYears.map((year) => (
                                    <option key={`${year.startYear}-${year.endYear}`} value={`${year.startYear}-${year.endYear}`}>
                                        {year.startYear}-{year.endYear} {year.isCurrent && '(Current)'}
                                    </option>
                                ))}
                            </FormSelect>
                        </div>
                    </section>

                    <div className="h-px bg-slate-200 dark:bg-slate-700" />

                    {/* Address */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-500" />
                            Address
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Full Address
                            </label>
                            <textarea
                                name="address"
                                rows={3}
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-base"
                                placeholder="Enter full residential address..."
                            />
                        </div>
                    </section>

                    <div className="h-px bg-slate-200 dark:bg-slate-700" />

                    {/* Parent Information */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" />
                            Parent Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormInput
                                label="Father's Name"
                                name="fatherName"
                                placeholder="Enter father's name"
                                icon={<User className="w-4 h-4" />}
                            />

                            <FormInput
                                label="Mother's Name"
                                name="motherName"
                                placeholder="Enter mother's name"
                                icon={<User className="w-4 h-4" />}
                            />

                            <FormInput
                                label="Parent Phone Number"
                                type="tel"
                                name="parentPhone"
                                placeholder="+91 98765 43210"
                                icon={<Phone className="w-4 h-4" />}
                            />
                        </div>
                    </section>

                    <div className="h-px bg-slate-200 dark:bg-slate-700" />

                    {/* File Uploads */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <Upload className="w-5 h-5 text-indigo-500" />
                            Documents
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Profile Image"
                                type="file"
                                name="image"
                                accept="image/*"
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
                            />

                            <FormInput
                                label="Documents (PDF)"
                                type="file"
                                name="documents"
                                accept=".pdf"
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
                            />
                        </div>
                    </section>

                    {/* Sticky Submit Action Bar */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 z-40 md:static md:bg-transparent md:border-0 md:p-0">
                        <div className="max-w-4xl mx-auto flex gap-4">
                            <button
                                type="submit"
                                disabled={loading || !selectedClassId || !admissionNo}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Create Student
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="px-6 py-3.5 border border-slate-300 dark:border-slate-600 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors hidden md:block"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
