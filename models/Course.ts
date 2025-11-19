import mongoose, { Schema, model, models } from 'mongoose';

export interface ICourse {
  _id?: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  department: mongoose.Types.ObjectId | string;
  teacher?: mongoose.Types.ObjectId | string;
  groups?: mongoose.Types.ObjectId[] | string[];
  semester: number;
  year: number;
  enrolledStudents?: mongoose.Types.ObjectId[] | string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: 1,
      max: 10,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    groups: [{
      type: Schema.Types.ObjectId,
      ref: 'StudentGroup',
    }],
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 2,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    enrolledStudents: [{
      type: Schema.Types.ObjectId,
      ref: 'Student',
    }],
  },
  {
    timestamps: true,
  }
);

const Course = models.Course || model<ICourse>('Course', CourseSchema);

export default Course;
