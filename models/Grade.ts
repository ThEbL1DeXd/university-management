import mongoose, { Schema, model, models } from 'mongoose';

export interface IGrade {
  _id?: string;
  student: mongoose.Types.ObjectId | string;
  course: mongoose.Types.ObjectId | string;
  grade: number;
  examType: 'Midterm' | 'Final' | 'Quiz' | 'Assignment';
  comments?: string;
  submittedBy?: mongoose.Types.ObjectId | string; // Teacher qui a soumis la note
  createdAt?: Date;
  updatedAt?: Date;
}

const GradeSchema = new Schema<IGrade>(
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
    grade: {
      type: Number,
      required: [true, 'Grade is required'],
      min: 0,
      max: 100,
    },
    examType: {
      type: String,
      enum: ['Midterm', 'Final', 'Quiz', 'Assignment'],
      required: [true, 'Exam type is required'],
    },
    comments: {
      type: String,
      trim: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
    },
  },
  {
    timestamps: true,
  }
);

// Index composé pour éviter les doublons
GradeSchema.index({ student: 1, course: 1, examType: 1 }, { unique: true });

const Grade = models.Grade || model<IGrade>('Grade', GradeSchema);

export default Grade;
