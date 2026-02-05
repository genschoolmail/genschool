import { getStudentsForAssignment, getFeeStructures, getClassesForDropdown } from "@/lib/fee-master-actions";
import FeeAssignmentClient from "./FeeAssignmentClient";

export default async function AssignFeePage() {
    const students = await getStudentsForAssignment();
    const feeStructures = await getFeeStructures();
    const classes = await getClassesForDropdown();

    return (
        <div className="p-6">
            <FeeAssignmentClient
                students={students}
                classes={classes}
                feeStructures={feeStructures}
            />
        </div>
    );
}
