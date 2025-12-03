/**
 * Seed script to add test data for teacher Jean Dupont
 * Adds more students and groups to his courses (INFO101 and INFO201)
 */

const mongoose = require('mongoose');
const path = require('path');

// MongoDB connection - update this to match your database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/university_db';

// Define schemas inline
const studentSchema = new mongoose.Schema({
  matricule: String,
  name: String,
  email: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentGroup' },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
});

const courseSchema = new mongoose.Schema({
  code: String,
  name: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});

const teacherSchema = new mongoose.Schema({
  name: String,
  email: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }
});

const departmentSchema = new mongoose.Schema({
  name: String,
  code: String
});

const groupSchema = new mongoose.Schema({
  name: String,
  code: String,
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});

const gradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  assignment: String,
  grade: Number,
  maxGrade: Number,
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
}, { timestamps: true });

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);
const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);
const StudentGroup = mongoose.models.StudentGroup || mongoose.model('StudentGroup', groupSchema);
const Grade = mongoose.models.Grade || mongoose.model('Grade', gradeSchema);

async function seedData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find Jean Dupont
    const jeanDupont = await Teacher.findOne({ name: 'Jean Dupont' });
    if (!jeanDupont) {
      console.error('❌ Teacher Jean Dupont not found!');
      return;
    }
    console.log(`✅ Found Jean Dupont: ${jeanDupont._id}`);

    // Find his courses
    const jeanCourses = await Course.find({ teacher: jeanDupont._id });
    console.log(`✅ Found ${jeanCourses.length} courses for Jean Dupont:`);
    jeanCourses.forEach(course => {
      console.log(`   - ${course.code}: ${course.name}`);
    });

    if (jeanCourses.length === 0) {
      console.error('❌ No courses found for Jean Dupont!');
      return;
    }

    const info101 = jeanCourses.find(c => c.code === 'INFO101');
    const info201 = jeanCourses.find(c => c.code === 'INFO201');

    // Find Informatique department
    const infoDept = await Department.findOne({ code: 'INFO' });
    if (!infoDept) {
      console.error('❌ Informatique department not found!');
      return;
    }

    // Create additional students for INFO101
    console.log('\n📝 Creating new students...');
    const newStudents = [
      {
        matricule: 'STU015',
        name: 'Alice Martin',
        email: 'alice.martin@university.edu',
        department: infoDept._id,
        enrolledCourses: info101 ? [info101._id] : []
      },
      {
        matricule: 'STU016',
        name: 'Bob Lefebvre',
        email: 'bob.lefebvre@university.edu',
        department: infoDept._id,
        enrolledCourses: info101 ? [info101._id] : []
      },
      {
        matricule: 'STU017',
        name: 'Claire Bernard',
        email: 'claire.bernard@university.edu',
        department: infoDept._id,
        enrolledCourses: info201 ? [info201._id] : []
      },
      {
        matricule: 'STU018',
        name: 'David Moreau',
        email: 'david.moreau@university.edu',
        department: infoDept._id,
        enrolledCourses: info201 ? [info201._id] : []
      },
      {
        matricule: 'STU019',
        name: 'Emma Dubois',
        email: 'emma.dubois@university.edu',
        department: infoDept._id,
        enrolledCourses: info101 && info201 ? [info101._id, info201._id] : []
      }
    ];

    const createdStudents = [];
    for (const studentData of newStudents) {
      const existing = await Student.findOne({ matricule: studentData.matricule });
      if (!existing) {
        const student = await Student.create(studentData);
        createdStudents.push(student);
        console.log(`✅ Created student: ${student.matricule} - ${student.name}`);
      } else {
        console.log(`⚠️  Student ${studentData.matricule} already exists`);
        createdStudents.push(existing);
      }
    }

    // Update courses with new enrolled students
    if (info101) {
      const newInfo101Students = createdStudents
        .filter(s => s.enrolledCourses.includes(info101._id))
        .map(s => s._id);
      
      await Course.findByIdAndUpdate(info101._id, {
        $addToSet: { enrolledStudents: { $each: newInfo101Students } }
      });
      console.log(`✅ Updated INFO101 with ${newInfo101Students.length} new students`);
    }

    if (info201) {
      const newInfo201Students = createdStudents
        .filter(s => s.enrolledCourses.includes(info201._id))
        .map(s => s._id);
      
      await Course.findByIdAndUpdate(info201._id, {
        $addToSet: { enrolledStudents: { $each: newInfo201Students } }
      });
      console.log(`✅ Updated INFO201 with ${newInfo201Students.length} new students`);
    }

    // Create student groups
    console.log('\n📝 Creating student groups...');
    const groups = [
      {
        name: 'Groupe INFO101-A',
        code: 'INFO101-A',
        courses: info101 ? [info101._id] : [],
        students: createdStudents.slice(0, 2).map(s => s._id) // Alice & Bob
      },
      {
        name: 'Groupe INFO201-B',
        code: 'INFO201-B',
        courses: info201 ? [info201._id] : [],
        students: createdStudents.slice(2, 4).map(s => s._id) // Claire & David
      },
      {
        name: 'Groupe Avancé INFO',
        code: 'INFO-ADV',
        courses: info101 && info201 ? [info101._id, info201._id] : [],
        students: [createdStudents[4]._id] // Emma (both courses)
      }
    ];

    for (const groupData of groups) {
      const existing = await StudentGroup.findOne({ code: groupData.code });
      if (!existing) {
        const group = await StudentGroup.create(groupData);
        console.log(`✅ Created group: ${group.code} - ${group.name} (${group.students.length} students)`);
      } else {
        console.log(`⚠️  Group ${groupData.code} already exists`);
      }
    }

    // Create some sample grades
    console.log('\n📝 Creating sample grades...');
    const gradesData = [
      {
        student: createdStudents[0]._id, // Alice
        course: info101?._id,
        assignment: 'TP1 - Introduction',
        grade: 85,
        maxGrade: 100,
        submittedBy: jeanDupont._id
      },
      {
        student: createdStudents[1]._id, // Bob
        course: info101?._id,
        assignment: 'TP1 - Introduction',
        grade: 78,
        maxGrade: 100,
        submittedBy: jeanDupont._id
      },
      {
        student: createdStudents[2]._id, // Claire
        course: info201?._id,
        assignment: 'Projet Final',
        grade: 92,
        maxGrade: 100,
        submittedBy: jeanDupont._id
      },
      {
        student: createdStudents[4]._id, // Emma (both courses)
        course: info101?._id,
        assignment: 'TP1 - Introduction',
        grade: 88,
        maxGrade: 100,
        submittedBy: jeanDupont._id
      },
      {
        student: createdStudents[4]._id, // Emma
        course: info201?._id,
        assignment: 'Projet Final',
        grade: 95,
        maxGrade: 100,
        submittedBy: jeanDupont._id
      }
    ];

    for (const gradeData of gradesData) {
      if (gradeData.course) {
        const existing = await Grade.findOne({
          student: gradeData.student,
          course: gradeData.course,
          assignment: gradeData.assignment
        });
        if (!existing) {
          await Grade.create(gradeData);
          console.log(`✅ Created grade for assignment: ${gradeData.assignment}`);
        } else {
          console.log(`⚠️  Grade already exists for ${gradeData.assignment}`);
        }
      }
    }

    // Show final summary
    console.log('\n📊 Final Summary for Jean Dupont:');
    const allJeanCourses = await Course.find({ teacher: jeanDupont._id }).populate('enrolledStudents');
    
    for (const course of allJeanCourses) {
      console.log(`\n📚 ${course.code} - ${course.name}:`);
      console.log(`   Students enrolled: ${course.enrolledStudents.length}`);
      course.enrolledStudents.forEach(student => {
        console.log(`   - ${student.matricule}: ${student.name}`);
      });
    }

    const jeanGroups = await StudentGroup.find({ 
      courses: { $in: allJeanCourses.map(c => c._id) } 
    }).populate('students');
    
    console.log(`\n👥 Student Groups (${jeanGroups.length}):`);
    jeanGroups.forEach(group => {
      console.log(`   - ${group.code}: ${group.name} (${group.students.length} students)`);
    });

    const jeanGrades = await Grade.find({
      course: { $in: allJeanCourses.map(c => c._id) }
    });
    console.log(`\n📝 Total Grades: ${jeanGrades.length}`);

    console.log('\n✅ Seed data completed successfully!');
    console.log('\n💡 You can now login as Jean Dupont and see:');
    console.log('   - Only students from INFO101 and INFO201');
    console.log('   - Only groups related to these courses');
    console.log('   - Only grades from these courses');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

seedData();
