import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import Course from '@/models/Course';
import Department from '@/models/Department';
import Grade from '@/models/Grade';
import { requireAuth } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    await dbConnect();
    
    const userRole = auth.role;
    const relatedId = (auth.session?.user as any)?.relatedId;
    
    // Stats pour les étudiants (personnalisées)
    if (userRole === 'student' && relatedId) {
      return getStudentStats(relatedId);
    }
    
    // Stats pour les enseignants (personnalisées)
    if (userRole === 'teacher' && relatedId) {
      return getTeacherStats(relatedId);
    }
    
    // Stats pour admin (globales)
    return getGlobalStats();
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// Stats globales pour admin/teacher
async function getGlobalStats() {
  const [studentsCount, teachersCount, coursesCount, departmentsCount, gradesCount] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    Course.countDocuments(),
    Department.countDocuments(),
    Grade.countDocuments(),
  ]);
  
  // Statistiques par département
  const studentsByDepartment = await Student.aggregate([
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: '_id',
        as: 'department',
      },
    },
    {
      $unwind: '$department',
    },
    {
      $project: {
        name: '$department.name',
        count: 1,
      },
    },
  ]);
  
  // Notes moyennes
  const averageGrades = await Grade.aggregate([
    {
      $group: {
        _id: null,
        average: { $avg: '$grade' },
      },
    },
  ]);
  
  return NextResponse.json({
    success: true,
    data: {
      role: 'admin',
      counts: {
        students: studentsCount,
        teachers: teachersCount,
        courses: coursesCount,
        departments: departmentsCount,
        grades: gradesCount,
      },
      studentsByDepartment,
      averageGrade: averageGrades[0]?.average || 0,
    },
  });
}

// Stats personnalisées pour étudiant
async function getStudentStats(studentId: string) {
  // Récupérer l'étudiant
  const student = await Student.findById(studentId).populate('department', 'name');
  if (!student) {
    return NextResponse.json(
      { success: false, error: 'Student not found' },
      { status: 404 }
    );
  }

  // Nombre de cours inscrits
  const enrolledCourses = await Course.countDocuments({
    enrolledStudents: studentId,
  });

  // Notes de l'étudiant
  const grades = await Grade.find({ student: studentId })
    .populate('course', 'name code credits')
    .sort({ createdAt: -1 });

  // Calculer les moyennes par cours
  const gradesByCourse = await Grade.aggregate([
    { $match: { student: student._id } },
    {
      $group: {
        _id: '$course',
        average: { $avg: '$grade' },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course',
      },
    },
    {
      $unwind: '$course',
    },
    {
      $project: {
        courseName: '$course.name',
        courseCode: '$course.code',
        average: { $round: ['$average', 1] },
        count: 1,
      },
    },
    { $sort: { average: -1 } },
  ]);

  // Moyenne générale
  const averageGrade = grades.length > 0
    ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
    : 0;

  // Distribution des notes (par tranche)
  const gradeDistribution = [
    { range: '90-100', count: 0, label: 'Excellent' },
    { range: '80-89', count: 0, label: 'Très bien' },
    { range: '70-79', count: 0, label: 'Bien' },
    { range: '60-69', count: 0, label: 'Passable' },
    { range: '0-59', count: 0, label: 'Insuffisant' },
  ];

  grades.forEach((g) => {
    if (g.grade >= 90) gradeDistribution[0].count++;
    else if (g.grade >= 80) gradeDistribution[1].count++;
    else if (g.grade >= 70) gradeDistribution[2].count++;
    else if (g.grade >= 60) gradeDistribution[3].count++;
    else gradeDistribution[4].count++;
  });

  // Dernières notes (5 dernières)
  const recentGrades = grades.slice(0, 5).map((g: any) => ({
    course: g.course?.name || 'N/A',
    code: g.course?.code || 'N/A',
    grade: g.grade,
    examType: g.examType,
    date: g.createdAt,
  }));

  return NextResponse.json({
    success: true,
    data: {
      role: 'student',
      studentInfo: {
        name: student.name,
        matricule: student.matricule,
        department: student.department?.name || 'N/A',
      },
      counts: {
        enrolledCourses,
        totalGrades: grades.length,
        averageGrade: Math.round(averageGrade * 10) / 10,
      },
      gradesByCourse,
      gradeDistribution,
      recentGrades,
    },
  });
}

// Stats personnalisées pour enseignant
async function getTeacherStats(teacherId: string) {
  // Récupérer l'enseignant
  const teacher = await Teacher.findById(teacherId)
    .populate('department', 'name');
  
  if (!teacher) {
    return NextResponse.json(
      { success: false, error: 'Teacher not found' },
      { status: 404 }
    );
  }

  // Cours enseignés par le teacher
  const courses = await Course.find({ teacher: teacherId })
    .populate('enrolledStudents', 'name matricule')
    .populate('department', 'name');

  // Nombre total d'étudiants dans ses cours
  const totalStudents = courses.reduce((sum, course) => {
    return sum + (course.enrolledStudents?.length || 0);
  }, 0);

  // Notes soumises par le teacher
  const grades = await Grade.find({ submittedBy: teacherId })
    .populate('student', 'name matricule')
    .populate('course', 'name code')
    .sort({ createdAt: -1 });

  // Moyenne des notes soumises
  const averageGrade = grades.length > 0
    ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
    : 0;

  // Stats par cours
  const statsByCourse = await Promise.all(
    courses.map(async (course) => {
      const courseGrades = await Grade.find({ course: course._id });
      const avg = courseGrades.length > 0
        ? courseGrades.reduce((sum, g) => sum + g.grade, 0) / courseGrades.length
        : 0;
      
      return {
        courseId: course._id,
        courseName: course.name,
        courseCode: course.code,
        studentsEnrolled: course.enrolledStudents?.length || 0,
        gradesSubmitted: courseGrades.length,
        averageGrade: Math.round(avg * 10) / 10,
      };
    })
  );

  // Distribution des notes soumises
  const gradeDistribution = [
    { range: '90-100', count: 0, label: 'Excellent' },
    { range: '80-89', count: 0, label: 'Très bien' },
    { range: '70-79', count: 0, label: 'Bien' },
    { range: '60-69', count: 0, label: 'Passable' },
    { range: '0-59', count: 0, label: 'Insuffisant' },
  ];

  grades.forEach((g) => {
    if (g.grade >= 90) gradeDistribution[0].count++;
    else if (g.grade >= 80) gradeDistribution[1].count++;
    else if (g.grade >= 70) gradeDistribution[2].count++;
    else if (g.grade >= 60) gradeDistribution[3].count++;
    else gradeDistribution[4].count++;
  });

  // Dernières notes soumises (5 dernières)
  const recentGrades = grades.slice(0, 5).map((g: any) => ({
    student: g.student?.name || 'N/A',
    matricule: g.student?.matricule || 'N/A',
    course: g.course?.name || 'N/A',
    code: g.course?.code || 'N/A',
    grade: g.grade,
    examType: g.examType,
    date: g.createdAt,
  }));

  // Activité récente (cours avec le plus de notes récentes)
  const recentActivity = statsByCourse
    .sort((a, b) => b.gradesSubmitted - a.gradesSubmitted)
    .slice(0, 5);

  return NextResponse.json({
    success: true,
    data: {
      role: 'teacher',
      teacherInfo: {
        name: teacher.name,
        email: teacher.email,
        department: teacher.department?.name || 'N/A',
        specialization: teacher.specialization || 'N/A',
      },
      counts: {
        coursesTeaching: courses.length,
        totalStudents,
        gradesSubmitted: grades.length,
        averageGrade: Math.round(averageGrade * 10) / 10,
      },
      statsByCourse,
      gradeDistribution,
      recentGrades,
      recentActivity,
    },
  });
}
