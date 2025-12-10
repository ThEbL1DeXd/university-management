import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Grade from '@/models/Grade';
import Teacher from '@/models/Teacher';
import Course from '@/models/Course';
import { requireAuth } from '@/lib/auth-helpers';
import { notifyNewGrade } from '@/lib/notificationService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const grade = await Grade.findById(id)
      .populate('student', 'name matricule email')
      .populate('course', 'name code credits')
      .populate('submittedBy', 'name email');
    
    if (!grade) {
      return NextResponse.json(
        { success: false, error: 'Grade not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: grade });
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
    const body = await request.json();
    const userRole = auth.role;
    const relatedId = (auth.session?.user as any)?.relatedId;

    // Get the grade to check permissions
    const existingGrade = await Grade.findById(id).populate('course');
    if (!existingGrade) {
      return NextResponse.json(
        { success: false, error: 'Grade not found' },
        { status: 404 }
      );
    }

    // If teacher, check if they have permission to edit grades
    if (userRole === 'teacher') {
      const teacher = await Teacher.findById(relatedId);
      
      if (!teacher) {
        return NextResponse.json(
          { success: false, error: 'Teacher not found' },
          { status: 404 }
        );
      }

      // Check if teacher has permission to edit grades
      if (!teacher.canEditGrades) {
        return NextResponse.json(
          { success: false, error: 'You do not have permission to edit grades. Please contact admin.' },
          { status: 403 }
        );
      }

      // Check if this grade belongs to one of teacher's courses
      const courseId = existingGrade.course._id.toString();
      const teacherCourses = await Course.find({ teacher: relatedId }).select('_id');
      const teacherCourseIds = teacherCourses.map(c => c._id.toString());

      if (!teacherCourseIds.includes(courseId)) {
        return NextResponse.json(
          { success: false, error: 'You can only edit grades for your own courses' },
          { status: 403 }
        );
      }
    } else if (userRole === 'student') {
      return NextResponse.json(
        { success: false, error: 'Students cannot edit grades' },
        { status: 403 }
      );
    }

    const grade = await Grade.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).populate('student', 'name matricule')
     .populate('course', 'name code')
     .populate('submittedBy', 'name');
    
    // Envoyer notification à l'étudiant sur la modification
    if (grade) {
      const student = grade.student as any;
      const course = grade.course as any;
      
      await notifyNewGrade(
        student._id.toString(),
        course.name,
        grade.grade,
        grade.examType,
        grade._id.toString(),
        course._id.toString()
      );
    }
    
    return NextResponse.json({ success: true, data: grade });
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
    const userRole = auth.role;

    // Only admin can delete grades
    if (userRole !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only admins can delete grades' },
        { status: 403 }
      );
    }

    const grade = await Grade.findByIdAndDelete(id);
    
    if (!grade) {
      return NextResponse.json(
        { success: false, error: 'Grade not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
