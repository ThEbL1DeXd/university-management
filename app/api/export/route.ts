import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import Course from '@/models/Course';
import Department from '@/models/Department';
import Grade from '@/models/Grade';
import StudentGroup from '@/models/StudentGroup';
import { checkRole } from '@/lib/auth-helpers';

// Ensure models are registered
const _deps = [Student, Teacher, Course, Department, Grade, StudentGroup];

export async function GET(request: NextRequest) {
  const auth = await checkRole(request, ['admin', 'teacher']);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // students, grades, courses, teachers
    const format = searchParams.get('format') || 'json'; // json, csv
    const departmentId = searchParams.get('department');
    const courseId = searchParams.get('course');
    const groupId = searchParams.get('group');
    const currentYear = searchParams.get('currentYear');
    const status = searchParams.get('status');

    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'students':
        let studentQuery: any = {};
        if (departmentId) studentQuery.department = departmentId;
        if (groupId) studentQuery.group = groupId;
        if (currentYear) studentQuery.currentYear = parseInt(currentYear);
        if (status) studentQuery.status = status;

        const students = await Student.find(studentQuery)
          .populate('department', 'name code')
          .populate('group', 'name level')
          .sort({ name: 1 });

        data = students.map(s => ({
          Matricule: s.matricule,
          Nom: s.name,
          Email: s.email,
          Téléphone: s.phone || '',
          Département: (s.department as any)?.name || '',
          Groupe: (s.group as any)?.name || '',
          'Année d\'étude': s.currentYear,
          'Année scolaire': s.academicYear,
          Statut: s.status,
        }));
        filename = 'etudiants';
        break;

      case 'grades':
        let gradeQuery: any = {};
        if (courseId) gradeQuery.course = courseId;

        const grades = await Grade.find(gradeQuery)
          .populate('student', 'name matricule')
          .populate('course', 'name code')
          .populate('teacher', 'name')
          .sort({ date: -1 });

        data = grades.map(g => ({
          Matricule: (g.student as any)?.matricule || '',
          Étudiant: (g.student as any)?.name || '',
          Cours: (g.course as any)?.name || '',
          Code: (g.course as any)?.code || '',
          Note: g.grade,
          'Type d\'examen': g.examType,
          Coefficient: g.coefficient,
          Date: new Date(g.date).toLocaleDateString('fr-FR'),
          Enseignant: (g.teacher as any)?.name || '',
        }));
        filename = 'notes';
        break;

      case 'courses':
        const courses = await Course.find()
          .populate('department', 'name code')
          .populate('teacher', 'name')
          .sort({ code: 1 });

        data = courses.map(c => ({
          Code: c.code,
          Nom: c.name,
          Crédits: c.credits,
          Département: (c.department as any)?.name || '',
          Enseignant: (c.teacher as any)?.name || '',
          Semestre: c.semester,
          Année: c.year,
        }));
        filename = 'cours';
        break;

      case 'teachers':
        const teachers = await Teacher.find()
          .populate('department', 'name code')
          .sort({ name: 1 });

        data = teachers.map(t => ({
          Nom: t.name,
          Email: t.email,
          Téléphone: t.phone || '',
          Département: (t.department as any)?.name || '',
          Spécialisation: t.specialization || '',
        }));
        filename = 'enseignants';
        break;

      case 'transcript':
        // Relevé de notes pour un étudiant
        const studentId = searchParams.get('studentId');
        if (!studentId) {
          return NextResponse.json(
            { success: false, error: 'studentId is required for transcript' },
            { status: 400 }
          );
        }

        const student = await Student.findById(studentId)
          .populate('department', 'name code');
        
        if (!student) {
          return NextResponse.json(
            { success: false, error: 'Student not found' },
            { status: 404 }
          );
        }

        const studentGrades = await Grade.find({ student: studentId })
          .populate('course', 'name code credits')
          .sort({ date: -1 });

        const transcript = {
          student: {
            name: student.name,
            matricule: student.matricule,
            department: (student.department as any)?.name,
            currentYear: student.currentYear,
            academicYear: student.academicYear,
          },
          grades: studentGrades.map(g => ({
            course: (g.course as any)?.name,
            code: (g.course as any)?.code,
            credits: (g.course as any)?.credits,
            grade: g.grade,
            examType: g.examType,
            date: g.date,
          })),
          summary: {
            totalCredits: studentGrades.reduce((sum, g) => sum + ((g.course as any)?.credits || 0), 0),
            averageGrade: studentGrades.length > 0 
              ? studentGrades.reduce((sum, g) => sum + g.grade, 0) / studentGrades.length 
              : 0,
            totalCourses: studentGrades.length,
          },
        };

        return NextResponse.json({ success: true, data: transcript });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid export type' },
          { status: 400 }
        );
    }

    // Générer CSV si demandé
    if (format === 'csv' && data.length > 0) {
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(';'),
        ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(';'))
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      meta: {
        total: data.length,
        exportedAt: new Date().toISOString(),
        type,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
