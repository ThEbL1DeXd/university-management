import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Course from '@/models/Course';
import { requireAuth, requireAdmin } from '@/lib/auth-helpers';

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
    
    let query: any = {};
    
    // Si l'utilisateur est un étudiant, ne montrer que SES cours
    if (userRole === 'student') {
      const relatedId = (auth.session?.user as any)?.relatedId;
      if (!relatedId) {
        return NextResponse.json(
          { success: false, error: 'Student ID not found' },
          { status: 400 }
        );
      }
      query.enrolledStudents = relatedId; // Chercher les cours où l'étudiant est inscrit
    }
    
    const courses = await Course.find(query)
      .populate('department', 'name code')
      .populate('teacher', 'name email')
      .populate('enrolledStudents', 'name matricule')
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
