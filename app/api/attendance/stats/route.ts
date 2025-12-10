import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';
import Course from '@/models/Course';
import { requireAuth, checkRole } from '@/lib/auth-helpers';

// GET - Get attendance statistics
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
    const studentId = searchParams.get('studentId');
    const groupId = searchParams.get('groupId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const userRole = auth.role;
    const relatedId = (auth.session?.user as any)?.relatedId;
    
    // Build query
    const matchQuery: any = {};
    
    if (courseId) matchQuery.course = courseId;
    if (groupId) matchQuery.group = groupId;
    
    // Students can only see their own stats
    if (userRole === 'student' && relatedId) {
      matchQuery.student = relatedId;
    } else if (userRole === 'teacher' && relatedId) {
      // Teachers can only see stats for their courses
      const teacherCourses = await Course.find({ teacher: relatedId }).select('_id');
      const courseIds = teacherCourses.map((c: any) => c._id);
      
      if (courseIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            summary: { total: 0, present: 0, absent: 0, late: 0, excused: 0, attendanceRate: 0 },
            byCourse: [],
            byStudent: []
          }
        });
      }
      
      matchQuery.course = { $in: courseIds };
    } else if (studentId) {
      matchQuery.student = studentId;
    }
    
    if (startDate && endDate) {
      matchQuery.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    // Get overall stats
    const overallStats = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    
    // Get stats by course
    const statsByCourse = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { course: '$course', status: '$status' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id.course',
          foreignField: '_id',
          as: 'courseInfo',
        },
      },
      {
        $unwind: '$courseInfo',
      },
      {
        $project: {
          course: '$courseInfo.name',
          courseCode: '$courseInfo.code',
          status: '$_id.status',
          count: 1,
        },
      },
    ]);
    
    // Get stats by student (for teachers/admin)
    let statsByStudent: any[] = [];
    if (userRole !== 'student') {
      statsByStudent = await Attendance.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { student: '$student', status: '$status' },
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'students',
            localField: '_id.student',
            foreignField: '_id',
            as: 'studentInfo',
          },
        },
        {
          $unwind: '$studentInfo',
        },
        {
          $project: {
            studentName: '$studentInfo.name',
            studentMatricule: '$studentInfo.matricule',
            status: '$_id.status',
            count: 1,
          },
        },
      ]);
    }
    
    // Calculate totals
    const total = overallStats.reduce((sum, s) => sum + s.count, 0);
    const present = overallStats.find(s => s._id === 'present')?.count || 0;
    const absent = overallStats.find(s => s._id === 'absent')?.count || 0;
    const late = overallStats.find(s => s._id === 'late')?.count || 0;
    const excused = overallStats.find(s => s._id === 'excused')?.count || 0;
    
    const attendanceRate = total > 0 ? ((present + late) / total * 100).toFixed(2) : 0;
    
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total,
          present,
          absent,
          late,
          excused,
          attendanceRate: Number(attendanceRate),
        },
        byStatus: overallStats,
        byCourse: statsByCourse,
        byStudent: statsByStudent,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
