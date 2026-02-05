import React from 'react';
import { getClasses } from '@/lib/actions';
import { NewFeeStructureForm } from './NewFeeStructureForm';

export default async function NewFeeStructurePage() {
    const classes = await getClasses();

    return <NewFeeStructureForm classes={classes} />;
}
