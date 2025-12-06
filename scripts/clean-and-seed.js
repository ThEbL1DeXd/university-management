/**
 * Complete Database Cleanup and Seed Script
 * Creates properly structured data with all relationships:
 * - Departments with teachers
 * - Teachers belonging to departments
 * - Groups belonging to departments with courses
 * - Students MUST be in a group
 * - Courses assigned to teachers and groups
 * - Grades for students in their courses
 * - User accounts for login
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/university_db';

// ===== SCHEMAS =====
const departmentSchema = new mongoose.Schema({
  name: String,
  code: { type: String, unique: true },
  description: String,
  head: String
}, { timestamps: true });

const teacherSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  specialization: String
}, { timestamps: true });

const studentGroupSchema = new mongoose.Schema({
  name: String,
  code: { type: String, unique: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  academicYear: String,
  level: String,
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
  name: String,
  code: { type: String, unique: true },
  description: String,
  credits: Number,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentGroup' }],
  semester: Number,
  year: Number,
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });

const studentSchema = new mongoose.Schema({
  name: String,
  matricule: { type: String, unique: true },
  email: { type: String, unique: true },
  phone: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentGroup', required: true },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  dateOfBirth: Date,
  address: String,
  academicYear: { type: String, default: '2024-2025' },
  currentYear: { type: Number, min: 1, max: 5, default: 1 },
  status: { type: String, enum: ['active', 'inactive', 'graduated', 'suspended'], default: 'active' }
}, { timestamps: true });

const gradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  grade: Number,
  examType: { type: String, enum: ['Midterm', 'Final', 'Quiz', 'Assignment'] },
  comments: String,
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'teacher', 'student'] },
  relatedId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const scheduleSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentGroup' },
  dayOfWeek: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] },
  startTime: String,
  endTime: String,
  room: String,
  type: { type: String, enum: ['cours', 'td', 'tp', 'examen'], default: 'cours' },
  semester: Number,
  academicYear: { type: String, default: '2024-2025' },
  isRecurring: { type: Boolean, default: true }
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  recipient: mongoose.Schema.Types.ObjectId,
  recipientType: { type: String, enum: ['student', 'teacher', 'admin'] },
  title: String,
  message: String,
  type: { type: String, enum: ['grade', 'schedule', 'announcement', 'reminder', 'alert'], default: 'announcement' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  isRead: { type: Boolean, default: false },
  link: String
}, { timestamps: true });

// ===== MODELS =====
const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);
const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);
const StudentGroup = mongoose.models.StudentGroup || mongoose.model('StudentGroup', studentGroupSchema);
const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
const Grade = mongoose.models.Grade || mongoose.model('Grade', gradeSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

async function cleanAndSeed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // ===== STEP 1: CLEAN ALL COLLECTIONS =====
    console.log('🧹 CLEANING DATABASE...');
    await Promise.all([
      Department.deleteMany({}),
      Teacher.deleteMany({}),
      StudentGroup.deleteMany({}),
      Course.deleteMany({}),
      Student.deleteMany({}),
      Grade.deleteMany({}),
      User.deleteMany({}),
      Schedule.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('✅ All collections cleaned\n');

    // ===== STEP 2: CREATE DEPARTMENTS =====
    console.log('🏛️  CREATING DEPARTMENTS...');
    const departments = await Department.insertMany([
      {
        name: 'Informatique',
        code: 'INFO',
        description: 'Département des Sciences Informatiques',
        head: 'Dr. Martin'
      },
      {
        name: 'Mathématiques',
        code: 'MATH',
        description: 'Département de Mathématiques Appliquées',
        head: 'Dr. Bernard'
      },
      {
        name: 'Physique',
        code: 'PHYS',
        description: 'Département de Physique',
        head: 'Dr. Leroy'
      }
    ]);
    
    const [deptInfo, deptMath, deptPhys] = departments;
    console.log(`✅ Created ${departments.length} departments\n`);

    // ===== STEP 3: CREATE TEACHERS =====
    console.log('👨‍🏫 CREATING TEACHERS...');
    const teachers = await Teacher.insertMany([
      // Informatique Department
      {
        name: 'Jean Dupont',
        email: 'jean.dupont@university.edu',
        phone: '+33 6 12 34 56 78',
        department: deptInfo._id,
        specialization: 'Programmation Web'
      },
      {
        name: 'Marie Lambert',
        email: 'marie.lambert@university.edu',
        phone: '+33 6 23 45 67 89',
        department: deptInfo._id,
        specialization: 'Base de Données'
      },
      // Mathématiques Department
      {
        name: 'Pierre Martin',
        email: 'pierre.martin@university.edu',
        phone: '+33 6 34 56 78 90',
        department: deptMath._id,
        specialization: 'Algèbre Linéaire'
      },
      {
        name: 'Sophie Bernard',
        email: 'sophie.bernard@university.edu',
        phone: '+33 6 45 67 89 01',
        department: deptMath._id,
        specialization: 'Analyse Mathématique'
      },
      // Physique Department
      {
        name: 'François Leroy',
        email: 'francois.leroy@university.edu',
        phone: '+33 6 56 78 90 12',
        department: deptPhys._id,
        specialization: 'Mécanique Quantique'
      }
    ]);

    const [teacherJean, teacherMarie, teacherPierre, teacherSophie, teacherFrancois] = teachers;
    console.log(`✅ Created ${teachers.length} teachers\n`);

    // ===== STEP 4: CREATE STUDENT GROUPS =====
    console.log('👥 CREATING STUDENT GROUPS...');
    const groups = await StudentGroup.insertMany([
      // Informatique Groups
      {
        name: 'Licence 1 Informatique - Groupe A',
        code: 'L1-INFO-A',
        department: deptInfo._id,
        academicYear: '2024-2025',
        level: 'L1'
      },
      {
        name: 'Licence 1 Informatique - Groupe B',
        code: 'L1-INFO-B',
        department: deptInfo._id,
        academicYear: '2024-2025',
        level: 'L1'
      },
      {
        name: 'Licence 2 Informatique',
        code: 'L2-INFO',
        department: deptInfo._id,
        academicYear: '2024-2025',
        level: 'L2'
      },
      {
        name: 'Licence 3 Informatique',
        code: 'L3-INFO',
        department: deptInfo._id,
        academicYear: '2024-2025',
        level: 'L3'
      },
      // Mathématiques Groups
      {
        name: 'Licence 1 Mathématiques',
        code: 'L1-MATH',
        department: deptMath._id,
        academicYear: '2024-2025',
        level: 'L1'
      },
      {
        name: 'Licence 2 Mathématiques',
        code: 'L2-MATH',
        department: deptMath._id,
        academicYear: '2024-2025',
        level: 'L2'
      },
      // Physique Groups
      {
        name: 'Licence 1 Physique',
        code: 'L1-PHYS',
        department: deptPhys._id,
        academicYear: '2024-2025',
        level: 'L1'
      }
    ]);

    const [grpL1InfoA, grpL1InfoB, grpL2Info, grpL3Info, grpL1Math, grpL2Math, grpL1Phys] = groups;
    console.log(`✅ Created ${groups.length} student groups\n`);

    // ===== STEP 5: CREATE COURSES =====
    console.log('📚 CREATING COURSES...');
    const courses = await Course.insertMany([
      // Jean Dupont's Courses (Informatique)
      {
        name: 'Programmation Web',
        code: 'INFO101',
        description: 'Introduction au développement web (HTML, CSS, JavaScript)',
        credits: 4,
        department: deptInfo._id,
        teacher: teacherJean._id,
        semester: 1,
        year: 2024,
        groups: [grpL1InfoA._id, grpL1InfoB._id]
      },
      {
        name: 'Algorithmes Avancés',
        code: 'INFO201',
        description: 'Structures de données et algorithmes complexes',
        credits: 5,
        department: deptInfo._id,
        teacher: teacherJean._id,
        semester: 1,
        year: 2024,
        groups: [grpL2Info._id]
      },
      // Marie Lambert's Courses (Informatique)
      {
        name: 'Base de Données',
        code: 'INFO102',
        description: 'Conception et manipulation de bases de données SQL',
        credits: 4,
        department: deptInfo._id,
        teacher: teacherMarie._id,
        semester: 1,
        year: 2024,
        groups: [grpL1InfoA._id, grpL1InfoB._id]
      },
      {
        name: 'NoSQL et Big Data',
        code: 'INFO301',
        description: 'Bases de données NoSQL et traitement de données massives',
        credits: 5,
        department: deptInfo._id,
        teacher: teacherMarie._id,
        semester: 1,
        year: 2024,
        groups: [grpL3Info._id]
      },
      // Pierre Martin's Courses (Mathématiques)
      {
        name: 'Algèbre Linéaire',
        code: 'MATH101',
        description: 'Vecteurs, matrices et espaces vectoriels',
        credits: 4,
        department: deptMath._id,
        teacher: teacherPierre._id,
        semester: 1,
        year: 2024,
        groups: [grpL1Math._id, grpL1InfoA._id] // Cross-department
      },
      // Sophie Bernard's Courses (Mathématiques)
      {
        name: 'Analyse Mathématique',
        code: 'MATH201',
        description: 'Calcul différentiel et intégral',
        credits: 5,
        department: deptMath._id,
        teacher: teacherSophie._id,
        semester: 1,
        year: 2024,
        groups: [grpL2Math._id]
      },
      // François Leroy's Courses (Physique)
      {
        name: 'Physique Générale',
        code: 'PHYS101',
        description: 'Mécanique classique et thermodynamique',
        credits: 4,
        department: deptPhys._id,
        teacher: teacherFrancois._id,
        semester: 1,
        year: 2024,
        groups: [grpL1Phys._id]
      },
      {
        name: 'Électromagnétisme',
        code: 'PHYS102',
        description: 'Champs électriques et magnétiques',
        credits: 4,
        department: deptPhys._id,
        teacher: teacherFrancois._id,
        semester: 2,
        year: 2024,
        groups: [grpL1Phys._id]
      }
    ]);

    const [crsWeb, crsAlgo, crsDB, crsNoSQL, crsAlgebra, crsAnalyse, crsPhysGen, crsElectro] = courses;
    console.log(`✅ Created ${courses.length} courses\n`);

    // ===== STEP 6: CREATE STUDENTS (ALL IN GROUPS) =====
    console.log('🎓 CREATING STUDENTS...');
    const studentsData = [
      // L1-INFO-A Students (5 students) - Année 1
      { name: 'Alice Martin', matricule: 'STU001', email: 'alice.martin@etu.university.edu', department: deptInfo._id, group: grpL1InfoA._id, phone: '+33 6 11 11 11 01', academicYear: '2024-2025', currentYear: 1, status: 'active' },
      { name: 'Bob Dupuis', matricule: 'STU002', email: 'bob.dupuis@etu.university.edu', department: deptInfo._id, group: grpL1InfoA._id, phone: '+33 6 11 11 11 02', academicYear: '2024-2025', currentYear: 1, status: 'active' },
      { name: 'Claire Fontaine', matricule: 'STU003', email: 'claire.fontaine@etu.university.edu', department: deptInfo._id, group: grpL1InfoA._id, phone: '+33 6 11 11 11 03', academicYear: '2024-2025', currentYear: 1, status: 'active' },
      { name: 'David Morel', matricule: 'STU004', email: 'david.morel@etu.university.edu', department: deptInfo._id, group: grpL1InfoA._id, phone: '+33 6 11 11 11 04', academicYear: '2024-2025', currentYear: 1, status: 'active' },
      { name: 'Emma Blanc', matricule: 'STU005', email: 'emma.blanc@etu.university.edu', department: deptInfo._id, group: grpL1InfoA._id, phone: '+33 6 11 11 11 05', academicYear: '2024-2025', currentYear: 1, status: 'active' },
      
      // L1-INFO-B Students (5 students) - Année 1
      { name: 'François Petit', matricule: 'STU006', email: 'francois.petit@etu.university.edu', department: deptInfo._id, group: grpL1InfoB._id, phone: '+33 6 11 11 11 06', academicYear: '2024-2025', currentYear: 1, status: 'active' },
      { name: 'Gabrielle Roux', matricule: 'STU007', email: 'gabrielle.roux@etu.university.edu', department: deptInfo._id, group: grpL1InfoB._id, phone: '+33 6 11 11 11 07', academicYear: '2024-2025', currentYear: 1, status: 'active' },
      { name: 'Hugo Vincent', matricule: 'STU008', email: 'hugo.vincent@etu.university.edu', department: deptInfo._id, group: grpL1InfoB._id, phone: '+33 6 11 11 11 08', academicYear: '2024-2025', currentYear: 1, status: 'active' },
      { name: 'Isabelle Mercier', matricule: 'STU009', email: 'isabelle.mercier@etu.university.edu', department: deptInfo._id, group: grpL1InfoB._id, phone: '+33 6 11 11 11 09', academicYear: '2024-2025', currentYear: 1, status: 'active' },
      { name: 'Julien Faure', matricule: 'STU010', email: 'julien.faure@etu.university.edu', department: deptInfo._id, group: grpL1InfoB._id, phone: '+33 6 11 11 11 10', academicYear: '2024-2025', currentYear: 1, status: 'active' },
      
      // L2-INFO Students (4 students) - Année 2
      { name: 'Karine Lefevre', matricule: 'STU011', email: 'karine.lefevre@etu.university.edu', department: deptInfo._id, group: grpL2Info._id, phone: '+33 6 11 11 11 11', academicYear: '2023-2024', currentYear: 2, status: 'active' },
      { name: 'Lucas Girard', matricule: 'STU012', email: 'lucas.girard@etu.university.edu', department: deptInfo._id, group: grpL2Info._id, phone: '+33 6 11 11 11 12', academicYear: '2023-2024', currentYear: 2, status: 'active' },
      { name: 'Manon Simon', matricule: 'STU013', email: 'manon.simon@etu.university.edu', department: deptInfo._id, group: grpL2Info._id, phone: '+33 6 11 11 11 13', academicYear: '2023-2024', currentYear: 2, status: 'active' },
      { name: 'Nicolas Laurent', matricule: 'STU014', email: 'nicolas.laurent@etu.university.edu', department: deptInfo._id, group: grpL2Info._id, phone: '+33 6 11 11 11 14', academicYear: '2023-2024', currentYear: 2, status: 'active' },
      
      // L3-INFO Students (3 students) - Année 3
      { name: 'Olivia Michel', matricule: 'STU015', email: 'olivia.michel@etu.university.edu', department: deptInfo._id, group: grpL3Info._id, phone: '+33 6 11 11 11 15', academicYear: '2022-2023', currentYear: 3, status: 'active' },
      { name: 'Paul Rousseau', matricule: 'STU016', email: 'paul.rousseau@etu.university.edu', department: deptInfo._id, group: grpL3Info._id, phone: '+33 6 11 11 11 16', academicYear: '2022-2023', currentYear: 3, status: 'active' },
      { name: 'Quentin Fournier', matricule: 'STU017', email: 'quentin.fournier@etu.university.edu', department: deptInfo._id, group: grpL3Info._id, phone: '+33 6 11 11 11 17', academicYear: '2022-2023', currentYear: 3, status: 'active' },
      
      // L1-MATH Students (4 students) - Année 1
      { name: 'Rachel Moreau', matricule: 'STU018', email: 'rachel.moreau@etu.university.edu', department: deptMath._id, group: grpL1Math._id, phone: '+33 6 11 11 11 18', academicYear: '2024-2025', currentYear: 1, status: 'active' },
      { name: 'Samuel Dubois', matricule: 'STU019', email: 'samuel.dubois@etu.university.edu', department: deptMath._id, group: grpL1Math._id, phone: '+33 6 11 11 11 19', academicYear: '2024-2025', currentYear: 1, status: 'active' },
      { name: 'Théo Garcia', matricule: 'STU020', email: 'theo.garcia@etu.university.edu', department: deptMath._id, group: grpL1Math._id, phone: '+33 6 11 11 11 20', academicYear: '2024-2025', currentYear: 1, status: 'active' },
      { name: 'Ursula Henry', matricule: 'STU021', email: 'ursula.henry@etu.university.edu', department: deptMath._id, group: grpL1Math._id, phone: '+33 6 11 11 11 21', academicYear: '2024-2025', currentYear: 1, status: 'active' },
      
      // L2-MATH Students (3 students) - Année 2
      { name: 'Victor Thomas', matricule: 'STU022', email: 'victor.thomas@etu.university.edu', department: deptMath._id, group: grpL2Math._id, phone: '+33 6 11 11 11 22', academicYear: '2023-2024', currentYear: 2, status: 'active' },
      { name: 'Wendy Robert', matricule: 'STU023', email: 'wendy.robert@etu.university.edu', department: deptMath._id, group: grpL2Math._id, phone: '+33 6 11 11 11 23', academicYear: '2023-2024', currentYear: 2, status: 'active' },
      { name: 'Xavier Richard', matricule: 'STU024', email: 'xavier.richard@etu.university.edu', department: deptMath._id, group: grpL2Math._id, phone: '+33 6 11 11 11 24', academicYear: '2023-2024', currentYear: 2, status: 'active' },
      
      // L1-PHYS Students (4 students) - Année 1
      { name: 'Yasmine Petit', matricule: 'STU025', email: 'yasmine.petit@etu.university.edu', department: deptPhys._id, group: grpL1Phys._id, phone: '+33 6 11 11 11 25', academicYear: '2024-2025', currentYear: 1, status: 'active' },
      { name: 'Zacharie Durand', matricule: 'STU026', email: 'zacharie.durand@etu.university.edu', department: deptPhys._id, group: grpL1Phys._id, phone: '+33 6 11 11 11 26', academicYear: '2024-2025', currentYear: 1, status: 'active' },
      { name: 'Amélie Bonnet', matricule: 'STU027', email: 'amelie.bonnet@etu.university.edu', department: deptPhys._id, group: grpL1Phys._id, phone: '+33 6 11 11 11 27', academicYear: '2024-2025', currentYear: 1, status: 'active' },
      { name: 'Baptiste Lemaire', matricule: 'STU028', email: 'baptiste.lemaire@etu.university.edu', department: deptPhys._id, group: grpL1Phys._id, phone: '+33 6 11 11 11 28', academicYear: '2024-2025', currentYear: 1, status: 'active' }
    ];

    const students = await Student.insertMany(studentsData);
    console.log(`✅ Created ${students.length} students (all assigned to groups)\n`);

    // ===== STEP 7: UPDATE RELATIONSHIPS =====
    console.log('🔗 UPDATING RELATIONSHIPS...');
    
    // Update groups with their students
    const groupStudentMap = {};
    students.forEach(student => {
      const groupId = student.group.toString();
      if (!groupStudentMap[groupId]) groupStudentMap[groupId] = [];
      groupStudentMap[groupId].push(student._id);
    });

    for (const [groupId, studentIds] of Object.entries(groupStudentMap)) {
      await StudentGroup.findByIdAndUpdate(groupId, { students: studentIds });
    }
    console.log('   ✅ Updated groups with students');

    // Update courses with enrolled students (based on groups)
    const courseGroupMap = {
      [crsWeb._id.toString()]: [grpL1InfoA, grpL1InfoB],
      [crsDB._id.toString()]: [grpL1InfoA, grpL1InfoB],
      [crsAlgo._id.toString()]: [grpL2Info],
      [crsNoSQL._id.toString()]: [grpL3Info],
      [crsAlgebra._id.toString()]: [grpL1Math, grpL1InfoA],
      [crsAnalyse._id.toString()]: [grpL2Math],
      [crsPhysGen._id.toString()]: [grpL1Phys],
      [crsElectro._id.toString()]: [grpL1Phys]
    };

    for (const [courseId, courseGroups] of Object.entries(courseGroupMap)) {
      const groupIds = courseGroups.map(g => g._id);
      const enrolledStudents = students.filter(s => 
        groupIds.some(gId => gId.toString() === s.group.toString())
      ).map(s => s._id);
      
      await Course.findByIdAndUpdate(courseId, { enrolledStudents });
      
      // Also update student's enrolledCourses
      for (const studentId of enrolledStudents) {
        await Student.findByIdAndUpdate(studentId, {
          $addToSet: { enrolledCourses: courseId }
        });
      }
    }
    console.log('   ✅ Updated courses with enrolled students');
    console.log('   ✅ Updated students with enrolled courses');

    // Update groups with their courses
    await StudentGroup.findByIdAndUpdate(grpL1InfoA._id, { courses: [crsWeb._id, crsDB._id, crsAlgebra._id] });
    await StudentGroup.findByIdAndUpdate(grpL1InfoB._id, { courses: [crsWeb._id, crsDB._id] });
    await StudentGroup.findByIdAndUpdate(grpL2Info._id, { courses: [crsAlgo._id] });
    await StudentGroup.findByIdAndUpdate(grpL3Info._id, { courses: [crsNoSQL._id] });
    await StudentGroup.findByIdAndUpdate(grpL1Math._id, { courses: [crsAlgebra._id] });
    await StudentGroup.findByIdAndUpdate(grpL2Math._id, { courses: [crsAnalyse._id] });
    await StudentGroup.findByIdAndUpdate(grpL1Phys._id, { courses: [crsPhysGen._id, crsElectro._id] });
    console.log('   ✅ Updated groups with courses\n');

    // ===== STEP 8: CREATE GRADES =====
    console.log('📝 CREATING GRADES...');
    const gradesData = [];
    
    // Generate grades for Jean Dupont's courses (INFO101, INFO201)
    const jeanStudents = students.filter(s => 
      [grpL1InfoA._id.toString(), grpL1InfoB._id.toString(), grpL2Info._id.toString()].includes(s.group.toString())
    );
    
    for (const student of jeanStudents) {
      // L1 students get INFO101 grades
      if ([grpL1InfoA._id.toString(), grpL1InfoB._id.toString()].includes(student.group.toString())) {
        gradesData.push({
          student: student._id,
          course: crsWeb._id,
          grade: Math.floor(Math.random() * 30) + 70, // 70-100
          examType: 'Midterm',
          comments: 'Bon travail',
          submittedBy: teacherJean._id
        });
      }
      // L2 students get INFO201 grades
      if (student.group.toString() === grpL2Info._id.toString()) {
        gradesData.push({
          student: student._id,
          course: crsAlgo._id,
          grade: Math.floor(Math.random() * 30) + 65, // 65-95
          examType: 'Assignment',
          comments: 'Algorithme bien implémenté',
          submittedBy: teacherJean._id
        });
      }
    }

    // Generate grades for Marie Lambert's courses
    const marieStudents = students.filter(s => 
      [grpL1InfoA._id.toString(), grpL1InfoB._id.toString(), grpL3Info._id.toString()].includes(s.group.toString())
    );
    
    for (const student of marieStudents) {
      if ([grpL1InfoA._id.toString(), grpL1InfoB._id.toString()].includes(student.group.toString())) {
        gradesData.push({
          student: student._id,
          course: crsDB._id,
          grade: Math.floor(Math.random() * 25) + 75, // 75-100
          examType: 'Quiz',
          comments: 'Bonne maîtrise SQL',
          submittedBy: teacherMarie._id
        });
      }
      if (student.group.toString() === grpL3Info._id.toString()) {
        gradesData.push({
          student: student._id,
          course: crsNoSQL._id,
          grade: Math.floor(Math.random() * 20) + 80, // 80-100
          examType: 'Final',
          comments: 'Excellent projet MongoDB',
          submittedBy: teacherMarie._id
        });
      }
    }

    await Grade.insertMany(gradesData);
    console.log(`✅ Created ${gradesData.length} grades\n`);

    // ===== STEP 9: CREATE USER ACCOUNTS =====
    console.log('👤 CREATING USER ACCOUNTS...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const usersData = [
      // Admin account
      {
        name: 'Administrateur',
        email: 'admin@university.edu',
        password: hashedPassword,
        role: 'admin',
        relatedId: null
      },
      // Teacher accounts
      {
        name: 'Jean Dupont',
        email: 'jean.dupont@university.edu',
        password: hashedPassword,
        role: 'teacher',
        relatedId: teacherJean._id
      },
      {
        name: 'Marie Lambert',
        email: 'marie.lambert@university.edu',
        password: hashedPassword,
        role: 'teacher',
        relatedId: teacherMarie._id
      },
      {
        name: 'Pierre Martin',
        email: 'pierre.martin@university.edu',
        password: hashedPassword,
        role: 'teacher',
        relatedId: teacherPierre._id
      },
      {
        name: 'Sophie Bernard',
        email: 'sophie.bernard@university.edu',
        password: hashedPassword,
        role: 'teacher',
        relatedId: teacherSophie._id
      },
      {
        name: 'François Leroy',
        email: 'francois.leroy@university.edu',
        password: hashedPassword,
        role: 'teacher',
        relatedId: teacherFrancois._id
      },
      // Student accounts (first 5 for testing)
      {
        name: 'Alice Martin',
        email: 'alice.martin@etu.university.edu',
        password: hashedPassword,
        role: 'student',
        relatedId: students[0]._id
      },
      {
        name: 'Bob Dupuis',
        email: 'bob.dupuis@etu.university.edu',
        password: hashedPassword,
        role: 'student',
        relatedId: students[1]._id
      },
      {
        name: 'Karine Lefevre',
        email: 'karine.lefevre@etu.university.edu',
        password: hashedPassword,
        role: 'student',
        relatedId: students[10]._id // L2 student
      }
    ];

    await User.insertMany(usersData);
    console.log(`✅ Created ${usersData.length} user accounts\n`);

    // ===== STEP 10: CREATE SCHEDULES =====
    console.log('📅 CREATING SCHEDULES...');
    const schedulesData = [
      // L1-INFO-A Schedule
      { course: crsWeb._id, teacher: teacherJean._id, group: grpL1InfoA._id, dayOfWeek: 'monday', startTime: '08:00', endTime: '10:00', room: 'A101', type: 'cours', semester: 1 },
      { course: crsWeb._id, teacher: teacherJean._id, group: grpL1InfoA._id, dayOfWeek: 'wednesday', startTime: '14:00', endTime: '16:00', room: 'TP1', type: 'tp', semester: 1 },
      { course: crsDB._id, teacher: teacherMarie._id, group: grpL1InfoA._id, dayOfWeek: 'tuesday', startTime: '10:00', endTime: '12:00', room: 'A102', type: 'cours', semester: 1 },
      { course: crsDB._id, teacher: teacherMarie._id, group: grpL1InfoA._id, dayOfWeek: 'thursday', startTime: '08:00', endTime: '10:00', room: 'TP2', type: 'tp', semester: 1 },
      { course: crsAlgebra._id, teacher: teacherPierre._id, group: grpL1InfoA._id, dayOfWeek: 'friday', startTime: '10:00', endTime: '12:00', room: 'B201', type: 'cours', semester: 1 },
      
      // L1-INFO-B Schedule
      { course: crsWeb._id, teacher: teacherJean._id, group: grpL1InfoB._id, dayOfWeek: 'monday', startTime: '10:00', endTime: '12:00', room: 'A101', type: 'cours', semester: 1 },
      { course: crsWeb._id, teacher: teacherJean._id, group: grpL1InfoB._id, dayOfWeek: 'thursday', startTime: '14:00', endTime: '16:00', room: 'TP1', type: 'tp', semester: 1 },
      { course: crsDB._id, teacher: teacherMarie._id, group: grpL1InfoB._id, dayOfWeek: 'tuesday', startTime: '14:00', endTime: '16:00', room: 'A102', type: 'cours', semester: 1 },
      { course: crsDB._id, teacher: teacherMarie._id, group: grpL1InfoB._id, dayOfWeek: 'friday', startTime: '08:00', endTime: '10:00', room: 'TP2', type: 'tp', semester: 1 },
      
      // L2-INFO Schedule
      { course: crsAlgo._id, teacher: teacherJean._id, group: grpL2Info._id, dayOfWeek: 'monday', startTime: '14:00', endTime: '16:00', room: 'A201', type: 'cours', semester: 1 },
      { course: crsAlgo._id, teacher: teacherJean._id, group: grpL2Info._id, dayOfWeek: 'wednesday', startTime: '08:00', endTime: '10:00', room: 'TP3', type: 'td', semester: 1 },
      
      // L3-INFO Schedule
      { course: crsNoSQL._id, teacher: teacherMarie._id, group: grpL3Info._id, dayOfWeek: 'tuesday', startTime: '08:00', endTime: '10:00', room: 'A301', type: 'cours', semester: 1 },
      { course: crsNoSQL._id, teacher: teacherMarie._id, group: grpL3Info._id, dayOfWeek: 'thursday', startTime: '10:00', endTime: '12:00', room: 'TP4', type: 'tp', semester: 1 },
      
      // L1-MATH Schedule
      { course: crsAlgebra._id, teacher: teacherPierre._id, group: grpL1Math._id, dayOfWeek: 'monday', startTime: '08:00', endTime: '10:00', room: 'B101', type: 'cours', semester: 1 },
      { course: crsAlgebra._id, teacher: teacherPierre._id, group: grpL1Math._id, dayOfWeek: 'wednesday', startTime: '10:00', endTime: '12:00', room: 'B101', type: 'td', semester: 1 },
      
      // L2-MATH Schedule
      { course: crsAnalyse._id, teacher: teacherSophie._id, group: grpL2Math._id, dayOfWeek: 'tuesday', startTime: '08:00', endTime: '10:00', room: 'B201', type: 'cours', semester: 1 },
      { course: crsAnalyse._id, teacher: teacherSophie._id, group: grpL2Math._id, dayOfWeek: 'thursday', startTime: '14:00', endTime: '16:00', room: 'B201', type: 'td', semester: 1 },
      
      // L1-PHYS Schedule
      { course: crsPhysGen._id, teacher: teacherFrancois._id, group: grpL1Phys._id, dayOfWeek: 'monday', startTime: '10:00', endTime: '12:00', room: 'C101', type: 'cours', semester: 2 },
      { course: crsPhysGen._id, teacher: teacherFrancois._id, group: grpL1Phys._id, dayOfWeek: 'wednesday', startTime: '14:00', endTime: '16:00', room: 'LAB1', type: 'tp', semester: 2 },
      { course: crsElectro._id, teacher: teacherFrancois._id, group: grpL1Phys._id, dayOfWeek: 'friday', startTime: '08:00', endTime: '10:00', room: 'C102', type: 'cours', semester: 2 },
      { course: crsElectro._id, teacher: teacherFrancois._id, group: grpL1Phys._id, dayOfWeek: 'friday', startTime: '14:00', endTime: '16:00', room: 'LAB2', type: 'tp', semester: 2 }
    ];
    
    await Schedule.insertMany(schedulesData);
    console.log(`✅ Created ${schedulesData.length} schedule entries\n`);

    // ===== STEP 11: CREATE NOTIFICATIONS =====
    console.log('🔔 CREATING NOTIFICATIONS...');
    const notificationsData = [
      // Notifications for students
      { recipient: students[0]._id, recipientType: 'student', title: 'Bienvenue !', message: 'Bienvenue dans le système de gestion universitaire. Consultez votre emploi du temps.', type: 'announcement', priority: 'high' },
      { recipient: students[0]._id, recipientType: 'student', title: 'Nouvelle note', message: 'Une nouvelle note a été ajoutée pour le cours Programmation Web.', type: 'grade', priority: 'medium', link: '/grades' },
      { recipient: students[0]._id, recipientType: 'student', title: 'Rappel examen', message: 'N\'oubliez pas l\'examen de Base de Données prévu la semaine prochaine.', type: 'reminder', priority: 'high' },
      { recipient: students[1]._id, recipientType: 'student', title: 'Bienvenue !', message: 'Bienvenue dans le système de gestion universitaire.', type: 'announcement', priority: 'medium' },
      { recipient: students[10]._id, recipientType: 'student', title: 'Changement d\'horaire', message: 'Le cours d\'Algorithmes Avancés a été déplacé au mercredi 10h.', type: 'schedule', priority: 'high', link: '/schedule' },
      
      // Notifications for teachers
      { recipient: teacherJean._id, recipientType: 'teacher', title: 'Notes à saisir', message: '10 étudiants attendent leurs notes pour le cours Programmation Web.', type: 'reminder', priority: 'medium' },
      { recipient: teacherMarie._id, recipientType: 'teacher', title: 'Réunion pédagogique', message: 'Réunion du département le vendredi à 14h.', type: 'announcement', priority: 'low' }
    ];
    
    await Notification.insertMany(notificationsData);
    console.log(`✅ Created ${notificationsData.length} notifications\n`);

    // ===== FINAL SUMMARY =====
    console.log('═'.repeat(60));
    console.log('📊 DATABASE SEED COMPLETED SUCCESSFULLY!');
    console.log('═'.repeat(60));
    console.log('\n📈 SUMMARY:');
    console.log(`   🏛️  Departments: ${departments.length}`);
    console.log(`   👨‍🏫 Teachers: ${teachers.length}`);
    console.log(`   👥 Student Groups: ${groups.length}`);
    console.log(`   📚 Courses: ${courses.length}`);
    console.log(`   🎓 Students: ${students.length}`);
    console.log(`   📝 Grades: ${gradesData.length}`);
    console.log(`   👤 User Accounts: ${usersData.length}`);
    console.log(`   📅 Schedules: ${schedulesData.length}`);
    console.log(`   🔔 Notifications: ${notificationsData.length}`);

    console.log('\n🔐 LOGIN CREDENTIALS (password: password123):');
    console.log('   Admin:    admin@university.edu');
    console.log('   Teacher:  jean.dupont@university.edu');
    console.log('   Teacher:  marie.lambert@university.edu');
    console.log('   Student:  alice.martin@etu.university.edu');

    console.log('\n📋 TEACHER-COURSE ASSIGNMENTS:');
    console.log('   Jean Dupont (INFO):');
    console.log('      → INFO101: Programmation Web (L1-INFO-A, L1-INFO-B) → 10 students');
    console.log('      → INFO201: Algorithmes Avancés (L2-INFO) → 4 students');
    console.log('   Marie Lambert (INFO):');
    console.log('      → INFO102: Base de Données (L1-INFO-A, L1-INFO-B) → 10 students');
    console.log('      → INFO301: NoSQL et Big Data (L3-INFO) → 3 students');
    console.log('   Pierre Martin (MATH):');
    console.log('      → MATH101: Algèbre Linéaire (L1-MATH, L1-INFO-A) → 9 students');
    console.log('   Sophie Bernard (MATH):');
    console.log('      → MATH201: Analyse Mathématique (L2-MATH) → 3 students');
    console.log('   François Leroy (PHYS):');
    console.log('      → PHYS101: Physique Générale (L1-PHYS) → 4 students');
    console.log('      → PHYS102: Électromagnétisme (L1-PHYS) → 4 students');

    console.log('\n✅ All data properly structured with relationships!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

cleanAndSeed();
