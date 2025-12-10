import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import NotificationPreferences from '@/models/NotificationPreferences';

// GET - Récupérer les préférences de notification de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await connectDB();

    const userId = (session.user as any).relatedId || (session.user as any).id;
    const userType = (session.user as any).role;

    let preferences = await NotificationPreferences.findOne({ user: userId });

    // Si pas de préférences, créer des préférences par défaut
    if (!preferences) {
      preferences = await NotificationPreferences.create({
        user: userId,
        userType: userType,
      });
    }

    return NextResponse.json({ success: true, data: preferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour les préférences de notification
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await connectDB();

    const userId = (session.user as any).relatedId || (session.user as any).id;
    const userType = (session.user as any).role;
    const body = await req.json();

    // Mettre à jour ou créer les préférences
    const preferences = await NotificationPreferences.findOneAndUpdate(
      { user: userId },
      {
        ...body,
        user: userId,
        userType: userType,
      },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: preferences });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
