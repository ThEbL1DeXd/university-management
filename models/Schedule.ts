import mongoose, { Schema, model, models } from 'mongoose';

export interface ISchedule {
  _id?: string;
  course: mongoose.Types.ObjectId | string;
  teacher: mongoose.Types.ObjectId | string;
  group: mongoose.Types.ObjectId | string;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  room: string;
  type: 'cours' | 'td' | 'tp' | 'examen';
  semester: 1 | 2;
  academicYear: string;
  isRecurring: boolean;
  specificDate?: Date; // Pour les événements non récurrents (examens)
  createdAt?: Date;
  updatedAt?: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher is required'],
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: 'StudentGroup',
      required: [true, 'Group is required'],
    },
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      required: [true, 'Day of week is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
    },
    room: {
      type: String,
      required: [true, 'Room is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['cours', 'td', 'tp', 'examen'],
      default: 'cours',
    },
    semester: {
      type: Number,
      enum: [1, 2],
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      default: '2024-2025',
    },
    isRecurring: {
      type: Boolean,
      default: true,
    },
    specificDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index pour optimiser les requêtes
ScheduleSchema.index({ group: 1, dayOfWeek: 1 });
ScheduleSchema.index({ teacher: 1, dayOfWeek: 1 });
ScheduleSchema.index({ course: 1 });

const Schedule = models.Schedule || model<ISchedule>('Schedule', ScheduleSchema);

export default Schedule;
