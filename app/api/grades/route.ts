import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Grade from '@/models/Grade';
import { requireAuth, requireAdminOrTeacher } from '@/lib/auth-helpers';

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
    
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');
    const courseId = searchParams.get('courseId');
    const userRole = auth.role;
    
    let query: any = {};
    
    // Si l'utilisateur est un étudiant, ne montrer que SES notes
    if (userRole === 'student') {
      const relatedId = (auth.session?.user as any)?.relatedId;
      if (!relatedId) {
        return NextResponse.json(
          { success: false, error: 'Student ID not found' },
          { status: 400 }
        );
      }
      query.student = relatedId;
    } else {
      // Admin et Teacher peuvent filtrer par étudiant/cours
      if (studentId) query.student = studentId;
      if (courseId) query.course = courseId;
    }
    
    const grades = await Grade.find(query)
      .populate('student', 'name matricule')
      .populate('course', 'name code')
      .populate('submittedBy', 'name')
      .sort({ createdAt: -1 });
      
    return NextResponse.json({ success: true, data: grades });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Admin ou Teacher peuvent créer des notes
  const auth = await requireAdminOrTeacher(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    await dbConnect();
    const body = await request.json();
    const grade = await Grade.create(body);
    const populatedGrade = await Grade.findById(grade._id)
      .populate('student', 'name matricule')
      .populate('course', 'name code')
      .populate('submittedBy', 'name');
    return NextResponse.json({ success: true, data: populatedGrade }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
