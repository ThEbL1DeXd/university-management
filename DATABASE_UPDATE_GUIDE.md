# Database Update Required

## Overview
The application has been updated to make it more dynamic with proper role-based filtering. Teachers now only see their own students, courses, and groups.

## Changes Made

### 1. Created StudentGroup Model
- File: `models/StudentGroup.ts`
- This model was missing and is now created to handle student groups properly

### 2. Updated API Routes with Role-Based Filtering

#### Students API (`/api/students/route.ts`)
- **Teachers**: Now see only students from groups that are enrolled in their courses
- **Admin**: Sees all students
- Fixed population to include group information

#### Teachers API (`/api/teachers/route.ts`)
- **Teachers**: Now see only their own profile
- **Admin**: Sees all teachers
- Properly populates courses to show count

#### Courses API (`/api/courses/route.ts`)
- **Teachers**: See only courses they teach
- **Students**: See only their enrolled courses
- **Admin**: Sees all courses
- Added groups population

#### Groups API (`/api/groups/route.ts`)
- **Teachers**: See only groups for courses they teach
- **Admin**: Sees all groups

### 3. Updated Auth Helpers
- Exported `getServerSession()` function for reuse across API routes

## Database Updates Needed

### Step 1: Import StudentGroup collection
The `university_db.studentgroups.json` file needs to be imported into MongoDB:

\`\`\`bash
mongoimport --db university_db --collection studentgroups --file "c:\Users\abdoa\OneDrive\Documents\school\mongo\university_db.studentgroups.json" --jsonArray
\`\`\`

### Step 2: Update Students to have Group reference
Some students might not have a `group` field. Run this in MongoDB shell:

\`\`\`javascript
// Connect to database
use university_db;

// Check students without groups
db.students.find({ group: { $exists: false } });

// If you need to assign students to groups, you can do it manually or run:
// (This is optional - only if you want to assign ungrouped students)
\`\`\`

### Step 3: Ensure Courses have Teacher reference
Check that courses are properly linked to teachers:

\`\`\`javascript
// Check courses without teachers
db.courses.find({ teacher: { $exists: false } });

// Check teachers with courses
db.teachers.find({}, { name: 1, courses: 1 });
\`\`\`

### Step 4: Verify Relationships
\`\`\`javascript
// Check StudentGroups have courses
db.studentgroups.find({}, { name: 1, courses: 1, students: 1 });

// Check if students are in the groups
db.studentgroups.aggregate([
  {
    $lookup: {
      from: "students",
      localField: "students",
      foreignField: "_id",
      as: "studentDetails"
    }
  },
  {
    $project: {
      name: 1,
      studentCount: { $size: "$studentDetails" },
      courseCount: { $size: "$courses" }
    }
  }
]);
\`\`\`

## Testing the Changes

### As Admin User:
1. Login as admin
2. Navigate to Students page - should see ALL students with course counts
3. Navigate to Teachers page - should see ALL teachers with course counts
4. Navigate to Courses page - should see ALL courses
5. Navigate to Groups page - should see ALL groups

### As Teacher User:
1. Login as a teacher (e.g., pierre.bernard@university.com)
2. Navigate to Students page - should see ONLY students from groups in their courses
3. Navigate to Teachers page - should see ONLY their own profile
4. Navigate to Courses page - should see ONLY courses they teach
5. Navigate to Groups page - should see ONLY groups for their courses

## Quick Verification Script

Run this in MongoDB shell to check the data structure:

\`\`\`javascript
use university_db;

print("=== Teachers with Courses ===");
db.teachers.find({}, { name: 1, email: 1, courses: 1 }).forEach(function(t) {
  print(t.name + " - Courses: " + (t.courses ? t.courses.length : 0));
});

print("\n=== Courses with Teachers ===");
db.courses.find({}, { name: 1, code: 1, teacher: 1 }).forEach(function(c) {
  print(c.name + " (" + c.code + ") - Teacher: " + (c.teacher ? "Yes" : "No"));
});

print("\n=== Student Groups ===");
db.studentgroups.find({}, { name: 1, students: 1, courses: 1 }).forEach(function(g) {
  print(g.name + " - Students: " + (g.students ? g.students.length : 0) + ", Courses: " + (g.courses ? g.courses.length : 0));
});

print("\n=== Students with Groups ===");
db.students.find({}, { name: 1, matricule: 1, group: 1, enrolledCourses: 1 }).forEach(function(s) {
  print(s.matricule + " - " + s.name + " - Group: " + (s.group ? "Yes" : "No") + ", Courses: " + (s.enrolledCourses ? s.enrolledCourses.length : 0));
});
\`\`\`

## Expected Behavior After Updates

### The "0 courses" Issue
The issue showing "0" for enrolled courses was caused by:
1. The `enrolledCourses` array not being populated properly
2. Missing relationships between students and courses

**Solution**: The API routes now properly populate all relationships using `.populate()` method.

### Dynamic Filtering
- **Teachers** see a filtered view based on their assigned courses
- **Students** see only their own data
- **Admin** sees everything

## Next Steps

1. **Import studentgroups collection** (if not already done)
2. **Restart the application**: `npm run dev`
3. **Test with different user roles**
4. **Verify data in MongoDB** using the verification script above

## Additional Improvements Made

1. **Better error handling** in API routes
2. **Consistent data population** across all routes
3. **Role-based filtering** at the database query level (more efficient)
4. **Group information** now displayed on students table
5. **Course count** properly calculated from populated array

## Files Modified

1. ✅ `models/StudentGroup.ts` - Created
2. ✅ `app/api/students/route.ts` - Updated with teacher filtering
3. ✅ `app/api/teachers/route.ts` - Updated with teacher filtering
4. ✅ `app/api/courses/route.ts` - Updated with teacher/student filtering
5. ✅ `app/api/groups/route.ts` - Updated with teacher filtering
6. ✅ `lib/auth-helpers.ts` - Exported getServerSession

## No Changes Needed

- ✅ `lib/permissions.ts` - Already correct (teachers have canViewAllStudents/Courses)
- ✅ `app/students/page.tsx` - Already handles enrolledCourses.length correctly
- ✅ `app/teachers/page.tsx` - Already shows courses.length correctly
- ✅ Frontend pages work correctly once API returns proper data
