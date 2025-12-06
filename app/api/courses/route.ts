import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Course from '@/models/Course';
import Department from '@/models/Department';
import Teacher from '@/models/Teacher';
import StudentGroup from '@/models/StudentGroup';
import { requireAuth, requireAdmin } from '@/lib/auth-helpers';
import mongoose from 'mongoose';

// Ensure models are registered for populate
const _deps = [Department, Teacher, StudentGroup];

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
    const relatedId = (auth.session?.user as any)?.relatedId;
    
    console.log('📚 Courses API - Role:', userRole, 'RelatedId:', relatedId);
    
    let query: any = {};
    
    // If teacher, show only courses they teach
    if (userRole === 'teacher') {
      if (!relatedId) {
        console.log('❌ Teacher ID not found in session');
        return NextResponse.json(
          { success: false, error: 'Teacher ID not found' },
          { status: 400 }
        );
      }
      query.teacher = relatedId; // Mongoose can handle string to ObjectId conversion
    }
    // Si l'utilisateur est un étudiant, ne montrer que SES cours
    else if (userRole === 'student') {
      if (!relatedId) {
        console.log('❌ Student ID not found in session');
        return NextResponse.json(
          { success: false, error: 'Student ID not found' },
          { status: 400 }
        );
      }
      // Use $in operator for array field matching
      query.enrolledStudents = { $in: [relatedId] };
    }
    
    console.log('📚 Courses query:', JSON.stringify(query));
    
    const courses = await Course.find(query)
      .populate('department', 'name code')
      .populate('teacher', 'name email')
      .populate('groups', 'name code')
      .sort({ name: 1 });
    
    console.log('📚 Found', courses.length, 'courses');
    
    return NextResponse.json({ success: true, data: courses });
  } catch (error: any) {
    console.error('❌ Courses API Error:', error);
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
