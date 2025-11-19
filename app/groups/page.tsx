'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, BookOpen, Plus, Edit, Trash2, X, Save, Building2, GraduationCap } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import ProtectedAction from '@/components/ProtectedAction';

interface StudentGroup {
  _id: string;
  name: string;
  code: string;
  department: { _id: string; name: string; code: string };
  academicYear: string;
  level: string;
  capacity: number;
  description?: string;
  courses: Array<{ _id: string; name: string; code: string }>;
  students: Array<{ _id: string; name: string; matricule: string }>;
  studentCount: number;
  courseCount: number;
  isFull: boolean;
}

interface Department {
  _id: string;
  name: string;
  code: string;
}

interface Course {
  _id: string;
  name: string;
  code: string;
}

interface Student {
  _id: string;
  name: string;
  matricule: string;
}

export default function GroupsPage() {
  const { can, isAdmin } = usePermissions();
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<StudentGroup | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: '',
    academicYear: '2024-2025',
    level: 'L1',
    capacity: 30,
    description: '',
    courses: [] as string[],
    students: [] as string[],
  });

  useEffect(() => {
    fetchGroups();
    fetchDepartments();
    fetchCourses();
    fetchStudents();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      const data = await response.json();
      if (data.success) {
        setGroups(data.data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      if (data.success) {
        setStudents(data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingGroup ? '/api/groups' : '/api/groups';
      const method = editingGroup ? 'PUT' : 'POST';
      const body = editingGroup
        ? { id: editingGroup._id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        fetchGroups();
        handleCloseModal();
      } else {
        alert(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Error saving group:', error);
      alert('Une erreur est survenue');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) return;

    try {
      const response = await fetch(`/api/groups?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchGroups();
      } else {
        alert(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Une erreur est survenue');
    }
  };

  const handleEdit = (group: StudentGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      code: group.code,
      department: group.department._id,
      academicYear: group.academicYear,
      level: group.level,
      capacity: group.capacity,
      description: group.description || '',
      courses: group.courses.map((c) => c._id),
      students: group.students.map((s) => s._id),
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGroup(null);
    setFormData({
      name: '',
      code: '',
      department: '',
      academicYear: '2024-2025',
      level: 'L1',
      capacity: 30,
      description: '',
      courses: [],
      students: [],
    });
  };

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      L1: 'from-blue-500 to-cyan-600',
      L2: 'from-green-500 to-emerald-600',
      L3: 'from-purple-500 to-pink-600',
      M1: 'from-orange-500 to-amber-600',
      M2: 'from-red-500 to-rose-600',
    };
    return colors[level] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Groupes d'étudiants
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Gérer les groupes et leurs affectations de cours
            </p>
          </div>
          <ProtectedAction permission="canCreateGroup">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Nouveau groupe
            </button>
          </ProtectedAction>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group._id}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${getLevelColor(group.level)} p-6 text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-white/20 backdrop-blur-sm">
                    {group.level}
                  </span>
                  <span className="text-sm opacity-90">{group.code}</span>
                </div>
                <h3 className="text-xl font-bold mb-1">{group.name}</h3>
                <p className="text-white/90 text-sm">{group.department.name}</p>
                <p className="text-white/80 text-xs mt-1">{group.academicYear}</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={18} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {group.studentCount}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      / {group.capacity} étudiants
                    </p>
                    {group.isFull && (
                      <span className="inline-block mt-2 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded">
                        Complet
                      </span>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen size={18} className="text-purple-600 dark:text-purple-400" />
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {group.courseCount}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">cours affectés</p>
                  </div>
                </div>

                {/* Description */}
                {group.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {group.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <ProtectedAction permission="canEditGroup">
                    <button
                      onClick={() => handleEdit(group)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 transition-all duration-200"
                    >
                      <Edit size={16} />
                      Modifier
                    </button>
                  </ProtectedAction>
                  <ProtectedAction permission="canDeleteGroup">
                    <button
                      onClick={() => handleDelete(group._id)}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 transition-all duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </ProtectedAction>
                </div>
              </div>
            </div>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500">
            <Users size={64} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Aucun groupe trouvé</p>
            <p className="text-sm">Créez votre premier groupe d'étudiants</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {editingGroup ? 'Modifier le groupe' : 'Nouveau groupe'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nom du groupe *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Groupe A - Informatique"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white uppercase"
                    placeholder="Ex: GRP-L1-INFO-A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Département *
                  </label>
                  <select
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Sélectionner...</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Niveau *
                  </label>
                  <select
                    required
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="L1">L1 (Licence 1)</option>
                    <option value="L2">L2 (Licence 2)</option>
                    <option value="L3">L3 (Licence 3)</option>
                    <option value="M1">M1 (Master 1)</option>
                    <option value="M2">M2 (Master 2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Année académique *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: 2024-2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Capacité *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Description du groupe..."
                />
              </div>

              {/* Courses Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <BookOpen size={18} />
                  Cours affectés
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                  {courses.map((course) => (
                    <label key={course._id} className="flex items-center gap-2 py-2 hover:bg-white dark:hover:bg-gray-800 px-2 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.courses.includes(course._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, courses: [...formData.courses, course._id] });
                          } else {
                            setFormData({ ...formData, courses: formData.courses.filter((id) => id !== course._id) });
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {course.code} - {course.name}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.courses.length} cours sélectionné(s)
                </p>
              </div>

              {/* Students Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Users size={18} />
                  Étudiants affectés
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                  {students.map((student) => (
                    <label key={student._id} className="flex items-center gap-2 py-2 hover:bg-white dark:hover:bg-gray-800 px-2 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.students.includes(student._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, students: [...formData.students, student._id] });
                          } else {
                            setFormData({ ...formData, students: formData.students.filter((id) => id !== student._id) });
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {student.matricule} - {student.name}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.students.length} étudiant(s) sélectionné(s)
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  <Save size={20} />
                  {editingGroup ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
