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
  academicYear: string; // Année scolaire d'inscription (ex: "2024-2025")
  currentYear: number;  // Année d'étude actuelle (1, 2, 3, 4, 5)
  status: 'active' | 'inactive' | 'graduated' | 'suspended'; // Statut de l'étudiant
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
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
      default: '2024-2025',
    },
    currentYear: {
      type: Number,
      required: [true, 'Current year is required'],
      min: 1,
      max: 5,
      default: 1,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated', 'suspended'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Student = models.Student || model<IStudent>('Student', StudentSchema);

export default Student;
