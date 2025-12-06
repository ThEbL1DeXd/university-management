import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Schedule from '@/models/Schedule';
import Course from '@/models/Course';
import Teacher from '@/models/Teacher';
import StudentGroup from '@/models/StudentGroup';
import { requireAuth, checkRole } from '@/lib/auth-helpers';

const _deps = [Course, Teacher, StudentGroup];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    await dbConnect();
    const { id } = await params;

    const schedule = await Schedule.findById(id)
      .populate('course', 'name code')
      .populate('teacher', 'name')
      .populate('group', 'name level');

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: schedule });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkRole(request, ['admin', 'teacher']);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    await dbConnect();
    const { id } = await params;
    const data = await request.json();

    // Vérifier les conflits d'horaire (exclure l'entrée actuelle)
    const conflict = await Schedule.findOne({
      _id: { $ne: id },
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

    const schedule = await Schedule.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate('course', 'name code')
      .populate('teacher', 'name')
      .populate('group', 'name level');

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: schedule });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkRole(request, ['admin']);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    await dbConnect();
    const { id } = await params;

    const schedule = await Schedule.findByIdAndDelete(id);

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Schedule deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
