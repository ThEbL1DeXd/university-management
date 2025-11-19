import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Teacher from '@/models/Teacher';
import { requirePermission, requireAdmin } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  // Seuls les utilisateurs avec permission canViewAllTeachers peuvent voir la liste
  const auth = await requirePermission(request, 'canViewAllTeachers');
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    await dbConnect();
    const teachers = await Teacher.find({})
      .populate('department', 'name code')
      .populate('courses', 'name code')
      .sort({ name: 1 });
    return NextResponse.json({ success: true, data: teachers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    await dbConnect();
    const body = await request.json();
    const teacher = await Teacher.create(body);
    const populatedTeacher = await Teacher.findById(teacher._id)
      .populate('department', 'name code')
      .populate('courses', 'name code');
    return NextResponse.json({ success: true, data: populatedTeacher }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
