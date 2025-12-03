/**
 * Complete Database Seed/Update Script
 * This script will:
 * 1. Import all collections properly
 * 2. Create proper relationships between all entities
 * 3. Ensure teachers have courses
 * 4. Ensure students are in groups and enrolled in courses
 * 5. Generate sample grades for testing
 * 
 * Usage: node scripts/seed-complete-database.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/university_db';

// Connect to database
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB:', MONGODB_URI);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function seedDatabase() {
  console.log('\n🌱 Starting complete database seed...\n');

  try {
    // Get collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    console.log('📚 Existing collections:', collectionNames.join(', '), '\n');

    // 1. Ensure teachers have courses
    console.log('=== Step 1: Assigning Courses to Teachers ===');
    
    const courses = await db.collection('courses').find({}).toArray();
    const teachers = await db.collection('teachers').find({}).toArray();
    
    // Assignment logic based on department and specialization
    const courseAssignments = {
      'Jean Dupont': ['Programmation', 'Algorithmique', 'POO'],
      'Marie Martin': ['Base de données', 'SQL'],
      'Pierre Bernard': ['Algèbre', 'Analyse', 'Mathématiques'],
      'Sophie Dubois': ['Analyse', 'Calcul', 'Mathématiques'],
      'Luc Thomas': ['Mécanique', 'Physique'],
      'Anne Robert': ['Chimie'],
      'Marc Petit': ['Biologie', 'Génétique']
    };

    let assignedCount = 0;
    for (const teacher of teachers) {
      const teacherName = teacher.name;
      const keywords = courseAssignments[teacherName] || [];
      
      // Find courses matching teacher's specialization
      const matchingCourses = courses.filter(course => {
        const courseName = course.name.toLowerCase();
        return keywords.some(keyword => courseName.includes(keyword.toLowerCase()));
      });

      if (matchingCourses.length > 0) {
        const courseIds = matchingCourses.map(c => c._id);
        
        // Update teacher with courses
        await db.collection('teachers').updateOne(
          { _id: teacher._id },
          { $set: { courses: courseIds } }
        );

        // Update courses with teacher
        await db.collection('courses').updateMany(
          { _id: { $in: courseIds } },
          { $set: { teacher: teacher._id } }
        );

        assignedCount++;
        console.log(`  ✓ ${teacherName}: ${matchingCourses.length} courses (${matchingCourses.map(c => c.code).join(', ')})`);
      } else {
        console.log(`  ⚠ ${teacherName}: No matching courses found`);
      }
    }
    console.log(`✅ Assigned courses to ${assignedCount} teachers\n`);

    // 2. Create or update student groups
    console.log('=== Step 2: Setting up Student Groups ===');
    
    const departments = await db.collection('departments').find({}).toArray();
    const students = await db.collection('students').find({}).toArray();
    
    // Create groups if they don't exist
    const existingGroups = await db.collection('studentgroups').find({}).toArray();
    
    if (existingGroups.length === 0) {
      console.log('  Creating student groups...');
      
      const groupsToCreate = [
        {
          name: 'Groupe A - L1 Informatique',
          code: 'GRP-L1-INFO-A',
          department: departments.find(d => d.name.includes('Informatique'))?._id,
          academicYear: '2024-2025',
          level: 'L1',
          courses: [],
          students: []
        },
        {
          name: 'Groupe B - L1 Informatique',
          code: 'GRP-L1-INFO-B',
          department: departments.find(d => d.name.includes('Informatique'))?._id,
          academicYear: '2024-2025',
          level: 'L1',
          courses: [],
          students: []
        },
        {
          name: 'Groupe A - L1 Mathématiques',
          code: 'GRP-L1-MATH-A',
          department: departments.find(d => d.name.includes('Mathématiques'))?._id,
          academicYear: '2024-2025',
          level: 'L1',
          courses: [],
          students: []
        },
        {
          name: 'Groupe A - L1 Physique',
          code: 'GRP-L1-PHYS-A',
          department: departments.find(d => d.name.includes('Physique'))?._id,
          academicYear: '2024-2025',
          level: 'L1',
          courses: [],
          students: []
        },
        {
          name: 'Groupe A - L1 Chimie',
          code: 'GRP-L1-CHEM-A',
          department: departments.find(d => d.name.includes('Chimie'))?._id,
          academicYear: '2024-2025',
          level: 'L1',
          courses: [],
          students: []
        },
        {
          name: 'Groupe A - L1 Biologie',
          code: 'GRP-L1-BIO-A',
          department: departments.find(d => d.name.includes('Biologie'))?._id,
          academicYear: '2024-2025',
          level: 'L1',
          courses: [],
          students: []
        }
      ];

      await db.collection('studentgroups').insertMany(groupsToCreate.filter(g => g.department));
      console.log(`  ✓ Created ${groupsToCreate.filter(g => g.department).length} groups`);
    }

    // 3. Assign students to groups
    console.log('\n=== Step 3: Assigning Students to Groups ===');
    
    const groups = await db.collection('studentgroups').find({}).toArray();
    let studentsAssigned = 0;

    for (const student of students) {
      // Find a group matching student's department
      const matchingGroup = groups.find(g => 
        g.department && g.department.toString() === student.department.toString()
      );

      if (matchingGroup) {
        // Update student with group
        await db.collection('students').updateOne(
          { _id: student._id },
          { $set: { group: matchingGroup._id } }
        );

        // Add student to group
        await db.collection('studentgroups').updateOne(
          { _id: matchingGroup._id },
          { $addToSet: { students: student._id } }
        );

        studentsAssigned++;
      }
    }
    console.log(`✅ Assigned ${studentsAssigned} students to groups\n`);

    // 4. Assign courses to groups
    console.log('=== Step 4: Assigning Courses to Groups ===');
    
    let coursesAssigned = 0;
    for (const group of groups) {
      if (!group.department) continue;

      // Find courses for this department
      const deptCourses = courses.filter(c => 
        c.department && c.department.toString() === group.department.toString()
      );

      if (deptCourses.length > 0) {
        const courseIds = deptCourses.map(c => c._id);

        // Update group with courses
        await db.collection('studentgroups').updateOne(
          { _id: group._id },
          { $set: { courses: courseIds } }
        );

        // Update courses with this group
        await db.collection('courses').updateMany(
          { _id: { $in: courseIds } },
          { $addToSet: { groups: group._id } }
        );

        coursesAssigned += deptCourses.length;
        console.log(`  ✓ ${group.code}: ${deptCourses.length} courses`);
      }
    }
    console.log(`✅ Assigned ${coursesAssigned} course-group relationships\n`);

    // 5. Enroll students in their group's courses
    console.log('=== Step 5: Enrolling Students in Courses ===');
    
    let enrollmentsCreated = 0;
    for (const student of students) {
      const studentDoc = await db.collection('students').findOne({ _id: student._id });
      
      if (studentDoc && studentDoc.group) {
        const group = await db.collection('studentgroups').findOne({ _id: studentDoc.group });
        
        if (group && group.courses && group.courses.length > 0) {
          // Update student with enrolled courses
          await db.collection('students').updateOne(
            { _id: student._id },
            { $set: { enrolledCourses: group.courses } }
          );

          // Add student to each course's enrolledStudents
          await db.collection('courses').updateMany(
            { _id: { $in: group.courses } },
            { $addToSet: { enrolledStudents: student._id } }
          );

          enrollmentsCreated += group.courses.length;
        }
      }
    }
    console.log(`✅ Created ${enrollmentsCreated} student course enrollments\n`);

    // 6. Generate sample grades
    console.log('=== Step 6: Generating Sample Grades ===');
    
    // Clear existing grades
    await db.collection('grades').deleteMany({});
    
    const grades = [];
    const gradedStudents = students.slice(0, 5); // Grade first 5 students
    
    for (const student of gradedStudents) {
      const studentDoc = await db.collection('students').findOne({ _id: student._id });
      
      if (studentDoc && studentDoc.enrolledCourses && studentDoc.enrolledCourses.length > 0) {
        for (const courseId of studentDoc.enrolledCourses) {
          const course = await db.collection('courses').findOne({ _id: courseId });
          
          if (course && course.teacher) {
            // Create 2-3 grades per course
            const numGrades = Math.floor(Math.random() * 2) + 2;
            
            for (let i = 0; i < numGrades; i++) {
              grades.push({
                student: student._id,
                course: courseId,
                value: Math.floor(Math.random() * 8) + 12, // Random grade between 12 and 20
                maxValue: 20,
                weight: 1,
                type: ['Exam', 'Quiz', 'Project'][i % 3],
                submittedBy: course.teacher,
                comments: 'Good work!',
                createdAt: new Date(),
                updatedAt: new Date()
              });
            }
          }
        }
      }
    }

    if (grades.length > 0) {
      await db.collection('grades').insertMany(grades);
      console.log(`✅ Created ${grades.length} sample grades\n`);
    }

    // 7. Print final statistics
    console.log('=== Final Database Statistics ===\n');
    
    const stats = {
      departments: await db.collection('departments').countDocuments(),
      teachers: await db.collection('teachers').countDocuments(),
      teachersWithCourses: await db.collection('teachers').countDocuments({ courses: { $exists: true, $ne: [] } }),
      students: await db.collection('students').countDocuments(),
      studentsWithGroups: await db.collection('students').countDocuments({ group: { $exists: true } }),
      studentsWithCourses: await db.collection('students').countDocuments({ enrolledCourses: { $exists: true, $ne: [] } }),
      courses: await db.collection('courses').countDocuments(),
      coursesWithTeachers: await db.collection('courses').countDocuments({ teacher: { $exists: true } }),
      groups: await db.collection('studentgroups').countDocuments(),
      grades: await db.collection('grades').countDocuments()
    };

    console.log(`📊 Departments: ${stats.departments}`);
    console.log(`👨‍🏫 Teachers: ${stats.teachers} (${stats.teachersWithCourses} with courses)`);
    console.log(`👨‍🎓 Students: ${stats.students} (${stats.studentsWithGroups} in groups, ${stats.studentsWithCourses} with courses)`);
    console.log(`📚 Courses: ${stats.courses} (${stats.coursesWithTeachers} with teachers)`);
    console.log(`👥 Groups: ${stats.groups}`);
    console.log(`📝 Grades: ${stats.grades}`);
    
    // Detailed teacher info
    console.log('\n=== Teacher Details ===');
    const teachersWithDetails = await db.collection('teachers').aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'courses',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          courseCount: { $size: '$courseDetails' },
          courses: '$courseDetails.code'
        }
      }
    ]).toArray();

    teachersWithDetails.forEach(t => {
      console.log(`  ${t.name}: ${t.courseCount} courses (${t.courses.join(', ')})`);
    });

    console.log('\n✅ Database seed completed successfully!\n');

  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  }
}

async function main() {
  await connectDB();
  await seedDatabase();
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
