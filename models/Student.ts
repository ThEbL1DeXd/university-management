import mongoose, { Schema, model, models } from 'mongoose';

export interface IStudent {
  _id?: string;
  name: string;
  matricule: string;
  email: string;
  phone?: string;
  department: mongoose.Types.ObjectId | string;
  group?: mongoose.Types.ObjectId | string;
  enrolledCourses?: mongoose.Types.ObjectId[] | string[];
  dateOfBirth?: Date;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    matricule: {
      type: String,
      required: [true, 'Matricule is required'],
      unique: true,
      uppercase: true,
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
    group: {
      type: Schema.Types.ObjectId,
      ref: 'StudentGroup',
    },
    enrolledCourses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course',
    }],
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Student = models.Student || model<IStudent>('Student', StudentSchema);

export default Student;
