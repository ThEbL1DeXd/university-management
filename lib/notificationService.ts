import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import NotificationPreferences from '@/models/NotificationPreferences';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';

/**
 * Service pour la gestion automatique des notifications
 */

interface NotificationData {
  recipient: string;
  recipientType: 'student' | 'teacher' | 'admin';
  title: string;
  message: string;
  type: 'grade' | 'schedule' | 'announcement' | 'reminder' | 'alert' | 'attendance';
  priority?: 'low' | 'medium' | 'high';
  link?: string;
  metadata?: {
    courseId?: string;
    gradeId?: string;
    scheduleId?: string;
    attendanceId?: string;
  };
}

/**
 * Créer une notification avec vérification des préférences
 */
export async function createNotification(data: NotificationData): Promise<boolean> {
  try {
    await dbConnect();

    // Vérifier les préférences de l'utilisateur
    const preferences = await NotificationPreferences.findOne({ user: data.recipient });
    
    if (preferences) {
      // Vérifier si le type de notification est activé
      const typePrefs = getTypePreferences(preferences, data.type);
      if (!typePrefs?.enabled) {
        console.log(`Notification skipped: ${data.type} disabled for user ${data.recipient}`);
        return false;
      }

      // Vérifier les heures silencieuses
      if (preferences.quietHoursEnabled) {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        if (isInQuietHours(currentTime, preferences.quietHoursStart, preferences.quietHoursEnd)) {
          console.log(`Notification delayed: quiet hours for user ${data.recipient}`);
          // Dans un système réel, on mettrait la notification en file d'attente
        }
      }
    }

    // Créer la notification
    const notification = await Notification.create({
      recipient: data.recipient,
      recipientType: data.recipientType,
      title: data.title,
      message: data.message,
      type: data.type === 'attendance' ? 'alert' : data.type,
      priority: data.priority || 'medium',
      link: data.link,
      metadata: data.metadata,
      isRead: false,
    });

    return !!notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

/**
 * Notifier sur une nouvelle note
 */
export async function notifyNewGrade(
  studentId: string,
  courseName: string,
  gradeValue: number,
  gradeType: string,
  gradeId: string,
  courseId: string
): Promise<boolean> {
  return createNotification({
    recipient: studentId,
    recipientType: 'student',
    title: 'Nouvelle note publiée',
    message: `Vous avez reçu une note de ${gradeValue}/20 en ${gradeType} pour le cours ${courseName}.`,
    type: 'grade',
    priority: 'high',
    link: '/grades',
    metadata: { gradeId, courseId },
  });
}

/**
 * Notifier sur un changement d'emploi du temps
 */
export async function notifyScheduleChange(
  recipientId: string,
  recipientType: 'student' | 'teacher',
  courseName: string,
  changeType: 'added' | 'modified' | 'cancelled',
  scheduleId: string
): Promise<boolean> {
  const changeMessages = {
    added: `Un nouveau cours "${courseName}" a été ajouté à votre emploi du temps.`,
    modified: `Le cours "${courseName}" a été modifié dans votre emploi du temps.`,
    cancelled: `Le cours "${courseName}" a été annulé.`,
  };

  return createNotification({
    recipient: recipientId,
    recipientType: recipientType,
    title: `Emploi du temps ${changeType === 'added' ? 'mis à jour' : changeType === 'cancelled' ? 'modifié' : 'modifié'}`,
    message: changeMessages[changeType],
    type: 'schedule',
    priority: changeType === 'cancelled' ? 'high' : 'medium',
    link: '/schedule',
    metadata: { scheduleId },
  });
}

/**
 * Notifier sur l'absence
 */
export async function notifyAbsence(
  studentId: string,
  courseName: string,
  date: Date,
  status: 'absent' | 'late'
): Promise<boolean> {
  const statusMessages = {
    absent: `Vous avez été marqué absent au cours de ${courseName} le ${date.toLocaleDateString('fr-FR')}.`,
    late: `Vous avez été marqué en retard au cours de ${courseName} le ${date.toLocaleDateString('fr-FR')}.`,
  };

  return createNotification({
    recipient: studentId,
    recipientType: 'student',
    title: status === 'absent' ? 'Absence enregistrée' : 'Retard enregistré',
    message: statusMessages[status],
    type: 'attendance',
    priority: 'high',
    link: '/attendance',
  });
}

/**
 * Notifier les étudiants d'un groupe
 */
export async function notifyGroupStudents(
  groupId: string,
  title: string,
  message: string,
  type: 'announcement' | 'reminder' | 'alert',
  link?: string
): Promise<number> {
  try {
    await dbConnect();
    
    const students = await Student.find({ group: groupId });
    let successCount = 0;

    for (const student of students) {
      const success = await createNotification({
        recipient: student._id.toString(),
        recipientType: 'student',
        title,
        message,
        type,
        link,
      });
      if (success) successCount++;
    }

    return successCount;
  } catch (error) {
    console.error('Error notifying group:', error);
    return 0;
  }
}

/**
 * Notifier tous les enseignants d'un département
 */
export async function notifyDepartmentTeachers(
  departmentId: string,
  title: string,
  message: string,
  type: 'announcement' | 'reminder' | 'alert'
): Promise<number> {
  try {
    await dbConnect();
    
    const teachers = await Teacher.find({ department: departmentId });
    let successCount = 0;

    for (const teacher of teachers) {
      const success = await createNotification({
        recipient: teacher._id.toString(),
        recipientType: 'teacher',
        title,
        message,
        type,
      });
      if (success) successCount++;
    }

    return successCount;
  } catch (error) {
    console.error('Error notifying department teachers:', error);
    return 0;
  }
}

/**
 * Obtenir les préférences par type de notification
 */
function getTypePreferences(
  preferences: any,
  type: string
): { enabled: boolean; email: boolean; push: boolean } | null {
  const typeMap: { [key: string]: string } = {
    grade: 'gradeNotifications',
    schedule: 'scheduleNotifications',
    attendance: 'attendanceNotifications',
    announcement: 'announcementNotifications',
    reminder: 'reminderNotifications',
    alert: 'alertNotifications',
  };

  const prefKey = typeMap[type];
  return prefKey ? preferences[prefKey] : null;
}

/**
 * Vérifier si l'heure actuelle est dans les heures silencieuses
 */
function isInQuietHours(current: string, start: string, end: string): boolean {
  // Convertir en minutes depuis minuit
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const currentMinutes = toMinutes(current);
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);

  // Si la période traverse minuit
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}
