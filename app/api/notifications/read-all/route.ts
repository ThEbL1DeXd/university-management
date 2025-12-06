import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import { requireAuth } from '@/lib/auth-helpers';

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    await dbConnect();
    
    const relatedId = (auth.session?.user as any)?.relatedId;

    if (!relatedId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Marquer toutes les notifications comme lues
    const result = await Notification.updateMany(
      { recipient: relatedId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return NextResponse.json({ 
      success: true, 
      message: `${result.modifiedCount} notifications marquées comme lues` 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
