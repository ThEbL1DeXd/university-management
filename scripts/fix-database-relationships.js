/**
 * Database Verification and Fix Script
 * Run this script to verify and fix relationships in the database
 * 
 * Usage: node scripts/fix-database-relationships.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/university_db';

// Define schemas
const StudentSchema = new mongoose.Schema({
  name: String,
  matricule: String,
  email: String,
  phone: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentGroup' },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  dateOfBirth: Date,
  address: String,
}, { timestamps: true });

const TeacherSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  specialization: String,
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
}, { timestamps: true });

const CourseSchema = new mongoose.Schema({
  name: String,
  code: String,
  description: String,
  credits: Number,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentGroup' }],
  semester: Number,
  year: Number,
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
}, { timestamps: true });

const StudentGroupSchema = new mongoose.Schema({
  name: String,
  code: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  academicYear: String,
  level: String,
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
}, { timestamps: true });

const Student = mongoose.model('Student', StudentSchema);
const Teacher = mongoose.model('Teacher', TeacherSchema);
const Course = mongoose.model('Course', CourseSchema);
const StudentGroup = mongoose.model('StudentGroup', StudentGroupSchema);

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function verifyAndFixRelationships() {
  console.log('\n📊 Starting database verification and fixes...\n');

  try {
    // 1. Check and sync Teacher-Course relationships
    console.log('=== Checking Teacher-Course Relationships ===');
    const teachers = await Teacher.find().populate('courses');
    const courses = await Course.find().populate('teacher');

    let fixedTeacherCourses = 0;
    for (const course of courses) {
      if (course.teacher) {
        const teacher = await Teacher.findById(course.teacher);
        if (teacher && !teacher.courses.includes(course._id)) {
          await Teacher.findByIdAndUpdate(
            teacher._id,
            { $addToSet: { courses: course._id } }
          );
          fixedTeacherCourses++;
          console.log(`  ✓ Added course ${course.code} to teacher ${teacher.name}`);
        }
      } else {
        console.log(`  ⚠ Course ${course.code} has no teacher assigned`);
      }
    }
    console.log(`✅ Fixed ${fixedTeacherCourses} teacher-course relationships\n`);

    // 2. Check and sync StudentGroup-Course relationships
    console.log('=== Checking StudentGroup-Course Relationships ===');
    const groups = await StudentGroup.find().populate('courses').populate('students');
    
    let fixedGroupCourses = 0;
    for (const group of groups) {
      if (group.courses && group.courses.length > 0) {
        for (const courseId of group.courses) {
          const course = await Course.findById(courseId);
          if (course && !course.groups.includes(group._id)) {
            await Course.findByIdAndUpdate(
              courseId,
              { $addToSet: { groups: group._id } }
            );
            fixedGroupCourses++;
            console.log(`  ✓ Added group ${group.code} to course ${course.code}`);
          }
        }
      }
    }
    console.log(`✅ Fixed ${fixedGroupCourses} group-course relationships\n`);

    // 3. Sync Student-Group relationships
    console.log('=== Checking Student-Group Relationships ===');
    let fixedStudentGroups = 0;
    for (const group of groups) {
      if (group.students && group.students.length > 0) {
        for (const studentId of group.students) {
          const student = await Student.findById(studentId);
          if (student && !student.group) {
            await Student.findByIdAndUpdate(
              studentId,
              { group: group._id }
            );
            fixedStudentGroups++;
            console.log(`  ✓ Assigned student ${student.matricule} to group ${group.code}`);
          }
        }
      }
    }
    console.log(`✅ Fixed ${fixedStudentGroups} student-group relationships\n`);

    // 4. Check and sync Student-Course enrollments
    console.log('=== Checking Student-Course Enrollments ===');
    const students = await Student.find().populate('group').populate('enrolledCourses');
    
    let fixedEnrollments = 0;
    for (const student of students) {
      if (student.group) {
        const group = await StudentGroup.findById(student.group).populate('courses');
        if (group && group.courses && group.courses.length > 0) {
          const groupCourseIds = group.courses.map(c => c._id || c);
          
          // Add group courses to student's enrolled courses if not already there
          for (const courseId of groupCourseIds) {
            if (!student.enrolledCourses.some(ec => ec.toString() === courseId.toString())) {
              await Student.findByIdAndUpdate(
                student._id,
                { $addToSet: { enrolledCourses: courseId } }
              );
              fixedEnrollments++;
              const course = await Course.findById(courseId);
              console.log(`  ✓ Enrolled student ${student.matricule} in course ${course?.code}`);
            }
            
            // Add student to course's enrolledStudents if not already there
            const course = await Course.findById(courseId);
            if (course && !course.enrolledStudents.includes(student._id)) {
              await Course.findByIdAndUpdate(
                courseId,
                { $addToSet: { enrolledStudents: student._id } }
              );
            }
          }
        }
      }
    }
    console.log(`✅ Fixed ${fixedEnrollments} student-course enrollments\n`);

    // 5. Print summary
    console.log('=== Final Summary ===');
    const teacherStats = await Teacher.aggregate([
      {
        $project: {
          name: 1,
          email: 1,
          courseCount: { $size: { $ifNull: ['$courses', []] } }
        }
      }
    ]);
    console.log('\nTeachers:');
    teacherStats.forEach(t => {
      console.log(`  ${t.name}: ${t.courseCount} courses`);
    });

    const studentStats = await Student.aggregate([
      {
        $project: {
          matricule: 1,
          name: 1,
          hasGroup: { $cond: [{ $ifNull: ['$group', false] }, 'Yes', 'No'] },
          courseCount: { $size: { $ifNull: ['$enrolledCourses', []] } }
        }
      }
    ]);
    console.log(`\nStudents: ${studentStats.length} total`);
    console.log(`  With groups: ${studentStats.filter(s => s.hasGroup === 'Yes').length}`);
    console.log(`  Without groups: ${studentStats.filter(s => s.hasGroup === 'No').length}`);
    console.log(`  Average courses per student: ${(studentStats.reduce((sum, s) => sum + s.courseCount, 0) / studentStats.length).toFixed(2)}`);

    const groupStats = await StudentGroup.aggregate([
      {
        $project: {
          name: 1,
          code: 1,
          studentCount: { $size: { $ifNull: ['$students', []] } },
          courseCount: { $size: { $ifNull: ['$courses', []] } }
        }
      }
    ]);
    console.log(`\nGroups: ${groupStats.length} total`);
    groupStats.forEach(g => {
      console.log(`  ${g.code}: ${g.studentCount} students, ${g.courseCount} courses`);
    });

    console.log('\n✅ Database verification and fixes completed!\n');

  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

async function main() {
  await connectDB();
  await verifyAndFixRelationships();
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
