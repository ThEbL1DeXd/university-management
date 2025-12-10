import mongoose, { Schema, model, models } from 'mongoose';

export interface IAttendance {
  _id?: string;
  student: mongoose.Types.ObjectId | string;
  course: mongoose.Types.ObjectId | string;
  schedule?: mongoose.Types.ObjectId | string;
  group: mongoose.Types.ObjectId | string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: Date;
  checkInMethod?: 'manual' | 'qr_code' | 'auto';
  qrCodeToken?: string;
  notes?: string;
  markedBy?: mongoose.Types.ObjectId | string; // Teacher who marked attendance
  createdAt?: Date;
  updatedAt?: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    schedule: {
      type: Schema.Types.ObjectId,
      ref: 'Schedule',
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: 'StudentGroup',
      required: [true, 'Group is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      default: 'absent',
    },
    checkInTime: {
      type: Date,
    },
    checkInMethod: {
      type: String,
      enum: ['manual', 'qr_code', 'auto'],
      default: 'manual',
    },
    qrCodeToken: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate attendance records
AttendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

// Index for efficient queries
AttendanceSchema.index({ course: 1, date: 1 });
AttendanceSchema.index({ student: 1, date: 1 });
AttendanceSchema.index({ group: 1, date: 1 });

const Attendance = models.Attendance || model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;
