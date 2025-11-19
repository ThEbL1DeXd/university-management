import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StudentGroup from '@/models/StudentGroup';
import Student from '@/models/Student';
import Course from '@/models/Course';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Récupérer tous les groupes ou un groupe spécifique
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('id');

    if (groupId) {
      // Récupérer un groupe spécifique avec toutes les relations
      const group = await StudentGroup.findById(groupId)
        .populate('department', 'name code')
        .populate('courses', 'name code credits teacher')
        .populate('students', 'name matricule email');

      if (!group) {
        return NextResponse.json(
          { success: false, error: 'Group not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: group,
      });
    }

    // Récupérer tous les groupes
    const groups = await StudentGroup.find()
      .populate('department', 'name code')
      .populate('courses', 'name code')
      .populate('students', 'name matricule')
      .sort({ code: 1 });

    // Enrichir avec les statistiques
    const enrichedGroups = groups.map((group: any) => ({
      ...group.toObject(),
      studentCount: group.students.length,
      courseCount: group.courses.length,
      isFull: group.students.length >= group.capacity,
    }));

    return NextResponse.json({
      success: true,
      data: enrichedGroups,
    });
  } catch (error: any) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau groupe
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, code, department, academicYear, level, capacity, description, courses, students } = body;

    // Validation
    if (!name || !code || !department || !academicYear || !level) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Vérifier si le code existe déjà
    const existingGroup = await StudentGroup.findOne({ code });
    if (existingGroup) {
      return NextResponse.json(
        { success: false, error: 'Group code already exists' },
        { status: 400 }
      );
    }

    // Créer le groupe
    const newGroup = await StudentGroup.create({
      name,
      code,
      department,
      academicYear,
      level,
      capacity: capacity || 30,
      description,
      courses: courses || [],
      students: students || [],
    });

    // Mettre à jour les étudiants avec la référence au groupe
    if (students && students.length > 0) {
      await Student.updateMany(
        { _id: { $in: students } },
        { $set: { group: newGroup._id } }
      );

      // Ajouter les étudiants aux cours du groupe
      if (courses && courses.length > 0) {
        await Course.updateMany(
          { _id: { $in: courses } },
          { 
            $addToSet: { 
              enrolledStudents: { $each: students },
              groups: newGroup._id
            } 
          }
        );
      }
    }

    // Mettre à jour les cours avec la référence au groupe
    if (courses && courses.length > 0) {
      await Course.updateMany(
        { _id: { $in: courses } },
        { $addToSet: { groups: newGroup._id } }
      );
    }

    const populatedGroup = await StudentGroup.findById(newGroup._id)
      .populate('department', 'name code')
      .populate('courses', 'name code')
      .populate('students', 'name matricule');

    return NextResponse.json(
      {
        success: true,
        data: populatedGroup,
        message: 'Group created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un groupe
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Group ID is required' },
        { status: 400 }
      );
    }

    const group = await StudentGroup.findById(id);
    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      );
    }

    // Si les étudiants changent, mettre à jour les relations
    if (updates.students) {
      const oldStudents = group.students.map((s: any) => s.toString());
      const newStudents = updates.students;

      // Retirer le groupe des anciens étudiants
      const removedStudents = oldStudents.filter((s: string) => !newStudents.includes(s));
      if (removedStudents.length > 0) {
        await Student.updateMany(
          { _id: { $in: removedStudents } },
          { $unset: { group: '' } }
        );
      }

      // Ajouter le groupe aux nouveaux étudiants
      const addedStudents = newStudents.filter((s: string) => !oldStudents.includes(s));
      if (addedStudents.length > 0) {
        await Student.updateMany(
          { _id: { $in: addedStudents } },
          { $set: { group: id } }
        );

        // Inscrire les nouveaux étudiants aux cours du groupe
        if (group.courses.length > 0) {
          await Course.updateMany(
            { _id: { $in: group.courses } },
            { $addToSet: { enrolledStudents: { $each: addedStudents } } }
          );
        }
      }
    }

    // Si les cours changent, mettre à jour les relations
    if (updates.courses) {
      const oldCourses = group.courses.map((c: any) => c.toString());
      const newCourses = updates.courses;

      // Retirer le groupe des anciens cours
      const removedCourses = oldCourses.filter((c: string) => !newCourses.includes(c));
      if (removedCourses.length > 0) {
        await Course.updateMany(
          { _id: { $in: removedCourses } },
          { $pull: { groups: id } }
        );
      }

      // Ajouter le groupe aux nouveaux cours
      const addedCourses = newCourses.filter((c: string) => !oldCourses.includes(c));
      if (addedCourses.length > 0) {
        await Course.updateMany(
          { _id: { $in: addedCourses } },
          { 
            $addToSet: { 
              groups: id,
              enrolledStudents: { $each: group.students }
            } 
          }
        );
      }
    }

    // Mettre à jour le groupe
    const updatedGroup = await StudentGroup.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('department', 'name code')
      .populate('courses', 'name code')
      .populate('students', 'name matricule');

    return NextResponse.json({
      success: true,
      data: updatedGroup,
      message: 'Group updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un groupe
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('id');

    if (!groupId) {
      return NextResponse.json(
        { success: false, error: 'Group ID is required' },
        { status: 400 }
      );
    }

    const group = await StudentGroup.findById(groupId);
    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      );
    }

    // Retirer la référence du groupe des étudiants
    await Student.updateMany(
      { group: groupId },
      { $unset: { group: '' } }
    );

    // Retirer la référence du groupe des cours
    await Course.updateMany(
      { groups: groupId },
      { $pull: { groups: groupId } }
    );

    // Supprimer le groupe
    await StudentGroup.findByIdAndDelete(groupId);

    return NextResponse.json({
      success: true,
      message: 'Group deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
