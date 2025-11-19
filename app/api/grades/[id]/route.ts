import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Grade from '@/models/Grade';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const grade = await Grade.findById(params.id)
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
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await request.json();
    const grade = await Grade.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).populate('student', 'name matricule')
     .populate('course', 'name code')
     .populate('submittedBy', 'name');
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const grade = await Grade.findByIdAndDelete(params.id);
    
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
