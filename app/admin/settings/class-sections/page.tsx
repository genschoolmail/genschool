import { getClasses } from '@/lib/actions/academics';
import ClassSectionsClient from './ClassSectionsClient';

export default async function ClassSectionsPage() {
    const classes = await getClasses();

    return <ClassSectionsClient initialClasses={classes} />;
}