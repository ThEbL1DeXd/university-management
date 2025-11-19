import mongoose from 'mongoose';

const studentGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ['L1', 'L2', 'L3', 'M1', 'M2'],
      required: true,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    capacity: {
      type: Number,
      default: 30,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances de recherche
studentGroupSchema.index({ code: 1 });
studentGroupSchema.index({ department: 1 });
studentGroupSchema.index({ academicYear: 1 });

// Méthode pour obtenir le nombre d'étudiants
studentGroupSchema.methods.getStudentCount = function () {
  return this.students.length;
};

// Méthode pour vérifier si le groupe est plein
studentGroupSchema.methods.isFull = function () {
  return this.students.length >= this.capacity;
};

// Méthode pour obtenir le nombre de cours
studentGroupSchema.methods.getCourseCount = function () {
  return this.courses.length;
};

const StudentGroup =
  mongoose.models.StudentGroup || mongoose.model('StudentGroup', studentGroupSchema);

export default StudentGroup;
