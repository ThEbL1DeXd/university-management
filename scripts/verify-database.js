/**
 * Simple Database Verification Script
 * Checks that the database structure is correct for the application
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/university_db';

async function verify() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Check collections exist
    console.log('=== Collections ===');
    const collections = await db.listCollections().toArray();
    const names = collections.map(c => c.name);
    console.log('Found:', names.join(', '), '\n');
    
    // Check teachers
    console.log('=== Teachers ===');
    const teachers = await db.collection('teachers').find({}).toArray();
    console.log(`Total: ${teachers.length}`);
    teachers.forEach(t => {
      console.log(`  - ${t.name} (${t.email})`);
    });
    
    // Check courses and their teachers
    console.log('\n=== Courses ===');
    const courses = await db.collection('courses').find({}).toArray();
    console.log(`Total: ${courses.length}`);
    
    const coursesByTeacher = {};
    courses.forEach(c => {
      const teacherId = c.teacher?.toString();
      if (teacherId) {
        if (!coursesByTeacher[teacherId]) coursesByTeacher[teacherId] = [];
        coursesByTeacher[teacherId].push(c.code);
      }
    });
    
    console.log('\nCourses by Teacher:');
    teachers.forEach(t => {
      const tid = t._id.toString();
      const tcourses = coursesByTeacher[tid] || [];
      console.log(`  ${t.name}: ${tcourses.length} courses (${tcourses.join(', ') || 'none'})`);
    });
    
    // Check students
    console.log('\n=== Students ===');
    const students = await db.collection('students').find({}).toArray();
    console.log(`Total: ${students.length}`);
    
    // Students by course
    console.log('\nStudents enrolled in courses:');
    const studentsByCourse = {};
    courses.forEach(c => {
      if (c.enrolledStudents && c.enrolledStudents.length > 0) {
        studentsByCourse[c.code] = c.enrolledStudents.length;
      }
    });
    
    Object.entries(studentsByCourse).forEach(([code, count]) => {
      console.log(`  ${code}: ${count} students`);
    });
    
    // Summary for teacher perspective
    console.log('\n=== Teacher View Simulation ===');
    console.log('For teacher: Jean Dupont (jean.dupont@university.com)');
    const jeanDupont = teachers.find(t => t.email === 'jean.dupont@university.com');
    if (jeanDupont) {
      const jeanCourses = courses.filter(c => c.teacher?.toString() === jeanDupont._id.toString());
      console.log(`  Teaches ${jeanCourses.length} courses: ${jeanCourses.map(c => c.code).join(', ')}`);
      
      const jeanStudentIds = new Set();
      jeanCourses.forEach(c => {
        if (c.enrolledStudents) {
          c.enrolledStudents.forEach(id => jeanStudentIds.add(id.toString()));
        }
      });
      console.log(`  Has ${jeanStudentIds.size} unique students enrolled`);
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verify();
