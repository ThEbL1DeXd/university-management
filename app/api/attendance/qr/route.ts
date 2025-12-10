import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';
import StudentGroup from '@/models/StudentGroup';
import { requireAuth, checkRole } from '@/lib/auth-helpers';
import crypto from 'crypto';

// Store active QR sessions (in production, use Redis)
const activeQRSessions: Map<string, {
  courseId: string;
  groupId: string;
  teacherId: string;
  date: Date;
  expiresAt: Date;
}> = new Map();

// POST - Generate QR code token for attendance
export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { courseId, groupId, validityMinutes = 15 } = body;
    
    const teacherId = (auth.session?.user as any)?.relatedId;
    
    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + validityMinutes * 60 * 1000);
    
    // Store session
    activeQRSessions.set(token, {
      courseId,
      groupId,
      teacherId,
      date: new Date(),
      expiresAt,
    });
    
    // Clean up expired sessions
    for (const [key, session] of activeQRSessions.entries()) {
      if (session.expiresAt < new Date()) {
        activeQRSessions.delete(key);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        token,
        expiresAt,
        qrCodeUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/attendance/qr-checkin?token=${token}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// GET - Check in with QR code (student scans QR)
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
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }
    
    // Verify token
    const session = activeQRSessions.get(token);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired QR code' },
        { status: 400 }
      );
    }
    
    if (session.expiresAt < new Date()) {
      activeQRSessions.delete(token);
      return NextResponse.json(
        { success: false, error: 'QR code has expired' },
        { status: 400 }
      );
    }
    
    // Get student ID from session
    const studentId = (auth.session?.user as any)?.relatedId;
    const userRole = auth.role;
    
    if (userRole !== 'student' || !studentId) {
      return NextResponse.json(
        { success: false, error: 'Only students can check in' },
        { status: 403 }
      );
    }
    
    // Verify student belongs to the group
    const student = await Student.findById(studentId);
    if (!student || student.group?.toString() !== session.groupId) {
      return NextResponse.json(
        { success: false, error: 'You are not enrolled in this group' },
        { status: 403 }
      );
    }
    
    // Create or update attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingAttendance = await Attendance.findOne({
      student: studentId,
      course: session.courseId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });
    
    if (existingAttendance) {
      if (existingAttendance.status === 'present') {
        return NextResponse.json(
          { success: false, error: 'You have already checked in' },
          { status: 400 }
        );
      }
      
      existingAttendance.status = 'present';
      existingAttendance.checkInTime = new Date();
      existingAttendance.checkInMethod = 'qr_code';
      existingAttendance.qrCodeToken = token;
      await existingAttendance.save();
      
      return NextResponse.json({
        success: true,
        message: 'Check-in successful!',
        data: existingAttendance,
      });
    }
    
    // Create new attendance record
    const attendance = await Attendance.create({
      student: studentId,
      course: session.courseId,
      group: session.groupId,
      date: new Date(),
      status: 'present',
      checkInTime: new Date(),
      checkInMethod: 'qr_code',
      qrCodeToken: token,
      markedBy: session.teacherId,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Check-in successful!',
      data: attendance,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
