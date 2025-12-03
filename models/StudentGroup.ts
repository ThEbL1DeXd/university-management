import mongoose, { Schema, model, models } from 'mongoose';

export interface IStudentGroup {
  _id?: string;
  name: string;
  code: string;
  department: mongoose.Types.ObjectId | string;
  academicYear: string;
  level: string;
  courses?: mongoose.Types.ObjectId[] | string[];
  students?: mongoose.Types.ObjectId[] | string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const StudentGroupSchema = new Schema<IStudentGroup>(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Group code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
    },
    level: {
      type: String,
      required: [true, 'Level is required'],
    },
    courses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course',
    }],
    students: [{
      type: Schema.Types.ObjectId,
      ref: 'Student',
    }],
  },
  {
    timestamps: true,
  }
);

export default models.StudentGroup || model<IStudentGroup>('StudentGroup', StudentGroupSchema);
