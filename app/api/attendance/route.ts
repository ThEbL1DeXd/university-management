import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';
import Course from '@/models/Course';
import StudentGroup from '@/models/StudentGroup';
import { requireAuth, checkRole } from '@/lib/auth-helpers';
import crypto from 'crypto';

// Ensure models are registered
const _deps = [Student, Course, StudentGroup];

// GET - Retrieve attendance records with filters
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
    const courseId = searchParams.get('courseId');
    const groupId = searchParams.get('groupId');
    const studentId = searchParams.get('studentId');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const query: any = {};
    
    if (courseId) query.course = courseId;
    if (groupId) query.group = groupId;
    if (studentId) query.student = studentId;
    
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: targetDate, $lt: nextDay };
    } else if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    // For students, only show their own attendance
    const userRole = auth.role;
    const relatedId = (auth.session?.user as any)?.relatedId;
    
    if (userRole === 'student' && relatedId) {
      query.student = relatedId;
    }
    
    // For teachers, only show attendance for their courses
    if (userRole === 'teacher' && relatedId) {
      const teacherCourses = await Course.find({ teacher: relatedId }).select('_id');
      const courseIds = teacherCourses.map(c => c._id);
      
      if (courseIds.length > 0) {
        query.course = { $in: courseIds };
      } else {
        // Teacher has no courses, return empty
        return NextResponse.json({ success: true, data: [] });
      }
    }
    
    const attendance = await Attendance.find(query)
      .populate('student', 'name matricule email')
      .populate('course', 'name code')
      .populate('group', 'name code')
      .populate('markedBy', 'name')
      .sort({ date: -1, createdAt: -1 });
    
    return NextResponse.json({ success: true, data: attendance });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// POST - Create or update attendance records (bulk)
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  // Only admin and teachers can mark attendance
  const isAdminOrTeacher = await checkRole(request, ['admin', 'teacher']);
  if (!isAdminOrTeacher) {
    return NextResponse.json(
      { success: false, error: 'Permission denied' },
      { status: 403 }
    );
  }

  try {
    await dbConnect();
    const body = await request.json();
    
    // Handle bulk attendance marking
    if (Array.isArray(body.records)) {
      const results = [];
      
      for (const record of body.records) {
        const existingRecord = await Attendance.findOne({
          student: record.student,
          course: record.course,
          date: new Date(record.date),
        });
        
        if (existingRecord) {
          // Update existing record
          existingRecord.status = record.status;
          existingRecord.notes = record.notes;
          existingRecord.markedBy = record.markedBy;
          await existingRecord.save();
          results.push(existingRecord);
        } else {
          // Create new record
          const newRecord = await Attendance.create({
            ...record,
            date: new Date(record.date),
          });
          results.push(newRecord);
        }
      }
      
      return NextResponse.json({ success: true, data: results }, { status: 201 });
    }
    
    // Handle single attendance record
    const attendance = await Attendance.create({
      ...body,
      date: new Date(body.date),
    });
    
    return NextResponse.json({ success: true, data: attendance }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// PUT - Update attendance record
export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  const isAdminOrTeacher = await checkRole(request, ['admin', 'teacher']);
  if (!isAdminOrTeacher) {
    return NextResponse.json(
      { success: false, error: 'Permission denied' },
      { status: 403 }
    );
  }

  try {
    await dbConnect();
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const attendance = await Attendance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('student', 'name matricule')
     .populate('course', 'name code');
    
    if (!attendance) {
      return NextResponse.json(
        { success: false, error: 'Attendance record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: attendance });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
