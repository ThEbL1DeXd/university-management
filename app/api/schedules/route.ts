import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Schedule from '@/models/Schedule';
import Course from '@/models/Course';
import Teacher from '@/models/Teacher';
import StudentGroup from '@/models/StudentGroup';
import Student from '@/models/Student';
import { requireAuth, checkRole } from '@/lib/auth-helpers';

// Ensure models are registered
const _deps = [Course, Teacher, StudentGroup, Student];

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
    
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const teacherId = searchParams.get('teacherId');
    const dayOfWeek = searchParams.get('day');
    const semester = searchParams.get('semester');
    
    const userRole = auth.role;
    const relatedId = (auth.session?.user as any)?.relatedId;

    let query: any = {};

    // Filtrer selon le rôle
    if (userRole === 'student' && relatedId) {
      // Trouver le groupe de l'étudiant
      const student = await Student.findById(relatedId);
      if (student?.group) {
        query.group = student.group;
      }
    } else if (userRole === 'teacher' && relatedId) {
      query.teacher = relatedId;
    }

    // Filtres additionnels
    if (groupId) query.group = groupId;
    if (teacherId) query.teacher = teacherId;
    if (dayOfWeek) query.dayOfWeek = dayOfWeek;
    if (semester) query.semester = parseInt(semester);

    const schedules = await Schedule.find(query)
      .populate('course', 'name code')
      .populate('teacher', 'name')
      .populate('group', 'name level')
      .sort({ dayOfWeek: 1, startTime: 1 });

    // Organiser par jour de la semaine
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const scheduleByDay = days.reduce((acc, day) => {
      acc[day] = schedules.filter(s => s.dayOfWeek === day);
      return acc;
    }, {} as Record<string, typeof schedules>);

    return NextResponse.json({
      success: true,
      data: {
        schedules,
        byDay: scheduleByDay,
        total: schedules.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await checkRole(request, ['admin', 'teacher']);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    await dbConnect();
    const data = await request.json();

    // Vérifier les conflits d'horaire
    const conflict = await Schedule.findOne({
      $or: [
        { group: data.group, dayOfWeek: data.dayOfWeek, startTime: { $lt: data.endTime }, endTime: { $gt: data.startTime } },
        { teacher: data.teacher, dayOfWeek: data.dayOfWeek, startTime: { $lt: data.endTime }, endTime: { $gt: data.startTime } },
        { room: data.room, dayOfWeek: data.dayOfWeek, startTime: { $lt: data.endTime }, endTime: { $gt: data.startTime } },
      ],
    });

    if (conflict) {
      return NextResponse.json(
        { success: false, error: 'Conflit d\'horaire détecté' },
        { status: 400 }
      );
    }

    const schedule = await Schedule.create(data);
    const populated = await Schedule.findById(schedule._id)
      .populate('course', 'name code')
      .populate('teacher', 'name')
      .populate('group', 'name level');

    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
