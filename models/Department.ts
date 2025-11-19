import mongoose, { Schema, model, models } from 'mongoose';

export interface IDepartment {
  _id?: string;
  name: string;
  code: string;
  description?: string;
  head?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    head: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Department = models.Department || model<IDepartment>('Department', DepartmentSchema);

export default Department;
