import React from 'react';
import { getStudents } from '@/lib/actions';
import { StudentsClient } from './StudentsClient';

export default async function StudentsPage() {
    const students = await getStudents();

    return <StudentsClient students={students} />;
}
