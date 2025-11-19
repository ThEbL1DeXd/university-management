import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';
import { requirePermission, requireAdmin } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  // Seuls les utilisateurs avec permission canViewAllStudents peuvent voir la liste
  const auth = await requirePermission(request, 'canViewAllStudents');
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    await dbConnect();
    const students = await Student.find({})
      .populate('department', 'name code')
      .populate('enrolledCourses', 'name code')
      .sort({ name: 1 });
    return NextResponse.json({ success: true, data: students });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Seul l'admin peut créer des étudiants
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
    const student = await Student.create(body);
    const populatedStudent = await Student.findById(student._id)
      .populate('department', 'name code')
      .populate('enrolledCourses', 'name code');
    return NextResponse.json({ success: true, data: populatedStudent }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
