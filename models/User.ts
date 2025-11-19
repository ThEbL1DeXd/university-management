import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  _id?: string;
  name?: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
  relatedId?: mongoose.Types.ObjectId; // ID de l'étudiant ou enseignant associé
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      default: 'student',
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      refPath: 'role',
    },
  },
  {
    timestamps: true,
  }
);

const User = models.User || model<IUser>('User', UserSchema);

export default User;
