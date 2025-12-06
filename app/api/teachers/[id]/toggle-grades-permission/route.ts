import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Teacher from '@/models/Teacher';
import { requireAdmin } from '@/lib/auth-helpers';

// Toggle teacher's permission to edit grades - Admin only
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    await dbConnect();
    const { id } = await params;
    
    const teacher = await Teacher.findById(id);
    
    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Toggle the canEditGrades permission
    teacher.canEditGrades = !teacher.canEditGrades;
    await teacher.save();

    const updatedTeacher = await Teacher.findById(id)
      .populate('department', 'name code')
      .populate('courses', 'name code');

    return NextResponse.json({ 
      success: true, 
      data: updatedTeacher,
      message: teacher.canEditGrades 
        ? `${teacher.name} can now edit grades` 
        : `${teacher.name} can no longer edit grades`
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
