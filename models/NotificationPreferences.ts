import mongoose, { Schema, model, models } from 'mongoose';

export interface INotificationPreferences {
  _id?: string;
  user: mongoose.Types.ObjectId | string;
  userType: 'student' | 'teacher' | 'admin';
  
  // Préférences par type de notification
  gradeNotifications: {
    enabled: boolean;
    email: boolean;
    push: boolean;
  };
  scheduleNotifications: {
    enabled: boolean;
    email: boolean;
    push: boolean;
  };
  attendanceNotifications: {
    enabled: boolean;
    email: boolean;
    push: boolean;
  };
  announcementNotifications: {
    enabled: boolean;
    email: boolean;
    push: boolean;
  };
  reminderNotifications: {
    enabled: boolean;
    email: boolean;
    push: boolean;
  };
  alertNotifications: {
    enabled: boolean;
    email: boolean;
    push: boolean;
  };
  
  // Préférences de timing
  quietHoursEnabled: boolean;
  quietHoursStart: string; // Format HH:mm
  quietHoursEnd: string;   // Format HH:mm
  
  // Résumé quotidien
  dailyDigest: {
    enabled: boolean;
    time: string; // Format HH:mm
  };
  
  // Préférences de langue
  language: 'fr' | 'en' | 'ar';
  
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    user: {
      type: Schema.Types.ObjectId,
      refPath: 'userModel',
      required: [true, 'User is required'],
      unique: true,
    },
    userType: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      required: true,
    },
    
    gradeNotifications: {
      enabled: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    scheduleNotifications: {
      enabled: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    attendanceNotifications: {
      enabled: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
    },
    announcementNotifications: {
      enabled: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    reminderNotifications: {
      enabled: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
    },
    alertNotifications: {
      enabled: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    
    quietHoursEnabled: { type: Boolean, default: false },
    quietHoursStart: { type: String, default: '22:00' },
    quietHoursEnd: { type: String, default: '07:00' },
    
    dailyDigest: {
      enabled: { type: Boolean, default: false },
      time: { type: String, default: '08:00' },
    },
    
    language: {
      type: String,
      enum: ['fr', 'en', 'ar'],
      default: 'fr',
    },
  },
  { timestamps: true }
);

// Index pour la recherche par utilisateur
NotificationPreferencesSchema.index({ user: 1 });

// Virtual pour le modèle utilisateur
NotificationPreferencesSchema.virtual('userModel').get(function() {
  const typeMap: { [key: string]: string } = {
    'student': 'Student',
    'teacher': 'Teacher',
    'admin': 'User',
  };
  return typeMap[this.userType];
});

const NotificationPreferences = models.NotificationPreferences || 
  model<INotificationPreferences>('NotificationPreferences', NotificationPreferencesSchema);

export default NotificationPreferences;
