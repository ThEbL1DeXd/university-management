import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import StudentGroup from '@/models/StudentGroup';
import { requirePermission, requireAdmin, getServerSession } from '@/lib/auth-helpers';

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
    
    const userRole = auth.role;
    let students;
    
    // Teachers can see ONLY their enrolled students
    if (userRole === 'teacher') {
      const relatedId = (auth.session?.user as any)?.relatedId;
      if (!relatedId) {
        return NextResponse.json(
          { success: false, error: 'Teacher ID not found' },
          { status: 400 }
        );
      }
      
      // Find all courses taught by this teacher
      const Course = (await import('@/models/Course')).default;
      const teacherCourses = await Course.find({ teacher: relatedId }).select('_id');
      const courseIds = teacherCourses.map(c => c._id);
      
      // Find students enrolled in these courses
      students = await Student.find({ enrolledCourses: { $in: courseIds } })
        .populate('department', 'name code')
        .populate('group', 'name code')
        .populate('enrolledCourses', 'name code')
        .sort({ name: 1 });
    } else {
      // Admins can see all students
      students = await Student.find({})
        .populate('department', 'name code')
        .populate('group', 'name code')
        .populate('enrolledCourses', 'name code')
        .sort({ name: 1 });
    }
    
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
