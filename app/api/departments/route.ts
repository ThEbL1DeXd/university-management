import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Department from '@/models/Department';
import { requirePermission, requireAdmin } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  // Seuls les utilisateurs avec permission canViewAllDepartments peuvent voir la liste
  const auth = await requirePermission(request, 'canViewAllDepartments');
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    await dbConnect();
    const departments = await Department.find({}).sort({ name: 1 });
    return NextResponse.json({ success: true, data: departments });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Seul l'admin peut créer des départements
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
    const department = await Department.create(body);
    return NextResponse.json({ success: true, data: department }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
