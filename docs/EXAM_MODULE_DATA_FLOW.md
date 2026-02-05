# Exam Module Data Flow Documentation

## Overview
This document explains how data flows through the Examination module and how to work with student/exam data correctly.

---

## Data Structure

### Student Data in Database
```prisma
model Student {
    id          String
    userId      String  // References User table
    user        User    // Relation to User for name, email
    admissionNo String
    rollNo      String
    classId     String
    class       Class
    profileImage String? // Direct field
    fatherName   String? // May not exist in all students
}

model User {
    name  String
    email String
    image String?
}
```

**Key Point:** Student name and email are in the `User` relation, not directly on `Student`!

### How to Access Student Data

❌ **WRONG:**
```typescript
student.name        // Doesn't exist!
student.email       // Doesn't exist!
```

✅ **CORRECT:**
```typescript
student.user.name   // Access via relation
student.user.email  // Access via relation
student.profileImage // Direct field (exists)
```

---

## Using Helper Functions

### Import Helper Functions
```typescript
import { 
    formatStudentForAdmitCard,
    formatAdmitCardData,
    formatExamSchedules,
    getStudentName,
    getStudentEmail
} from '@/lib/helpers/exam-data-transformers';
```

### Transform Database Results

**For Admit Cards:**
```typescript
// After querying admitCard with includes
const formattedAdmitCard = formatAdmitCardData(admitCard);

// Now pass to component
<AdmitCardTemplate admitCard={formattedAdmitCard} />
```

**For Student Data:**
```typescript
// Safe extraction with fallbacks
const studentName = getStudentName(student);
const studentEmail = getStudentEmail(student);
const profileImage = getStudentProfileImage(student);
```

**For Schedule Data:**
```typescript
const formattedSchedules = formatExamSchedules(schedules);
```

---

## Component Type Safety

### Import Shared Types
```typescript
import type { AdmitCardData, ExamScheduleData } from '@/types/exam';
```

### Use in Component Props
```typescript
interface MyComponentProps {
    admitCard: AdmitCardData;      // Use shared type
    schedules: ExamScheduleData[]; // Use shared type
}
```

**Benefits:**
- TypeScript catches mismatches at compile time
- Auto-complete in IDE
- Consistent structure across app

---

## Common Patterns

### Pattern 1: Fetch and Format Admit Card
```typescript
// 1. Query with proper includes
const admitCard = await prisma.admitCard.findUnique({
    where: { id },
    include: {
        examGroup: true,
        student: {
            include: {
                class: true,
                user: true  // IMPORTANT: Include user!
            }
        }
    }
});

// 2. Format using helper
const formatted = formatAdmitCardData(admitCard);

// 3. Pass to component
return <AdmitCardTemplate admitCard={formatted} />;
```

### Pattern 2: Display Student Info in Lists
```typescript
{admitCards.map(card => (
    <tr key={card.id}>
        <td>{getStudentName(card.student)}</td>
        <td>{card.student.rollNo}</td>
        <td>{getStudentClassDesignation(card.student)}</td>
    </tr>
))}
```

### Pattern 3: Fetch Schedules
```typescript
const schedules = await prisma.examSchedule.findMany({
    where: {
        examGroupId,
        classId: student.classId || undefined // Handle null
    },
    include: { subject: true }
});

const formatted = formatExamSchedules(schedules);
```

---

## Database Query Guidelines

### Always Include User Relation
When querying students that need name/email:
```typescript
include: {
    student: {
        include: {
            user: true,  // ✅ Required for name/email
            class: true
        }
    }
}
```

### Handle Nullable Fields
```typescript
// classId might be null
classId: student.classId || undefined

// Use optional chaining
student.class?.name
```

---

## File Structure

```
exam-module/
├── types/exam.ts                    # Shared type definitions
├── lib/helpers/
│   └── exam-data-transformers.ts   # Data transformation helpers
├── components/
│   └── AdmitCardTemplate.tsx       # Uses shared types
└── app/admin/exams/
    ├── admit-cards/
    │   ├── page.tsx                # List page
    │   └── [id]/page.tsx           # Detail page - uses helpers
    └── marksheets/
        └── ...                      # Uses same patterns
```

---

## Troubleshooting

### Error: "Cannot read property 'name' of undefined"
**Cause:** Trying to access `student.name` directly
**Fix:** Use `student.user.name` or helper `getStudentName(student)`

### Error: Type mismatch in component
**Cause:** Passing raw Prisma data to component  
**Fix:** Use `formatAdmitCardData()` before passing

### Error: "classId is null"
**Cause:** Student not assigned to class  
**Fix:** Add null check: `classId: student.classId || undefined`

---

## Quick Reference

| Task | Helper Function | Import From |
|------|----------------|-------------|
| Format admit card | `formatAdmitCardData(data)` | `@/lib/helpers/exam-data-transformers` |
| Format student | `formatStudentForAdmitCard(student)` | `@/lib/helpers/exam-data-transformers` |
| Format schedules | `formatExamSchedules(schedules)` | `@/lib/helpers/exam-data-transformers` |
| Get student name | `getStudentName(student)` | `@/lib/helpers/exam-data-transformers` |
| Get student email | `getStudentEmail(student)` | `@/lib/helpers/exam-data-transformers` |
| Validate student | `validateStudentForAdmitCard(student)` | `@/lib/helpers/exam-data-transformers` |

---

## Best Practices

1. ✅ **Always use helper functions** for data transformation
2. ✅ **Always include user relation** when querying students
3. ✅ **Use shared types** for component props
4. ✅ **Handle null values** with optional chaining or fallbacks
5. ✅ **Validate data** before passing to components
6. ❌ **Never access** `student.name` directly
7. ❌ **Never write** inline transformation logic
8. ❌ **Never skip** type definitions

---

## Examples in Codebase

**Working Example:** `app/admin/exams/admit-cards/[id]/page.tsx`
- Uses `formatAdmitCardData()`
- Imports shared types
- Handles null values correctly

**Reference Implementation:** `lib/helpers/exam-data-transformers.ts`
- All helper functions with documentation
- Handles edge cases
- Type-safe

---

## Getting Help

If you encounter issues:
1. Check this documentation
2. Look at `app/admin/exams/admit-cards/[id]/page.tsx` for reference
3. Review helper functions in `lib/helpers/exam-data-transformers.ts`
4. Check type definitions in `types/exam.ts`
