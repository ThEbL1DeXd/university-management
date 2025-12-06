import mongoose, { Schema, model, models } from 'mongoose';

export interface INotification {
  _id?: string;
  recipient: mongoose.Types.ObjectId | string;
  recipientType: 'student' | 'teacher' | 'admin';
  title: string;
  message: string;
  type: 'grade' | 'schedule' | 'announcement' | 'reminder' | 'alert';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  readAt?: Date;
  link?: string; // Lien vers la ressource concernée
  metadata?: {
    courseId?: string;
    gradeId?: string;
    scheduleId?: string;
  };
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      refPath: 'recipientModel',
      required: [true, 'Recipient is required'],
    },
    recipientType: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ['grade', 'schedule', 'announcement', 'reminder', 'alert'],
      default: 'announcement',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    link: {
      type: String,
      trim: true,
    },
    metadata: {
      courseId: String,
      gradeId: String,
      scheduleId: String,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index pour optimiser les requêtes
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual pour le modèle de destinataire
NotificationSchema.virtual('recipientModel').get(function() {
  const typeMap: { [key: string]: string } = {
    'student': 'Student',
    'teacher': 'Teacher',
    'admin': 'User',
  };
  return typeMap[this.recipientType];
});

const Notification = models.Notification || model<INotification>('Notification', NotificationSchema);

export default Notification;
