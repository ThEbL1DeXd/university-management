import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Course from '@/models/Course';
import { requireAuth, requireAdmin, getServerSession } from '@/lib/auth-helpers';

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
    const session = await getServerSession();
    const userRole = auth.role;
    
    let query: any = {};
    
    // If teacher, show only courses they teach
    if (userRole === 'teacher') {
      const relatedId = session?.user?.relatedId;
      if (!relatedId) {
        return NextResponse.json(
          { success: false, error: 'Teacher ID not found' },
          { status: 400 }
        );
      }
      query.teacher = relatedId;
    }
    // Si l'utilisateur est un étudiant, ne montrer que SES cours
    else if (userRole === 'student') {
      const relatedId = session?.user?.relatedId;
      if (!relatedId) {
        return NextResponse.json(
          { success: false, error: 'Student ID not found' },
          { status: 400 }
        );
      }
      query.enrolledStudents = relatedId;
    }
    
    const courses = await Course.find(query)
      .populate('department', 'name code')
      .populate('teacher', 'name email')
      .populate('groups', 'name code')
      .sort({ name: 1 });
    
    return NextResponse.json({ success: true, data: courses });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Seul l'admin peut créer des cours
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
    const course = await Course.create(body);
    const populatedCourse = await Course.findById(course._id)
      .populate('department', 'name code')
      .populate('teacher', 'name email')
      .populate('enrolledStudents', 'name matricule');
    return NextResponse.json({ success: true, data: populatedCourse }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
