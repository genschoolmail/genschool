import React from 'react';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { createSalary } from '@/lib/finance-actions';
import { getTeachers } from '@/lib/actions';
import { NewSalaryForm } from './NewSalaryForm';

export default async function NewSalaryPage() {
    const teachers = await getTeachers();
    const drivers = await prisma.driver.findMany({
        include: { user: true },
        orderBy: { user: { name: 'asc' } }
    });

    const createSalaryAction = async (formData: FormData) => {
        'use server';
        await createSalary(formData);
        redirect('/admin/finance/salary');
    };

    return <NewSalaryForm teachers={teachers} drivers={drivers} createSalaryAction={createSalaryAction} />;
}
