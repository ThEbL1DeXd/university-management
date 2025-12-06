import mongoose, { Schema, model, models } from 'mongoose';

export interface ITeacher {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  department: mongoose.Types.ObjectId | string;
  specialization?: string;
  courses?: mongoose.Types.ObjectId[] | string[];
  canEditGrades?: boolean; // Admin grants permission to edit grades
  createdAt?: Date;
  updatedAt?: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    name: {
      type: String,
      required: [true, 'Teacher name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    specialization: {
      type: String,
      trim: true,
    },
    courses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course',
    }],
    canEditGrades: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Teacher = models.Teacher || model<ITeacher>('Teacher', TeacherSchema);

export default Teacher;
